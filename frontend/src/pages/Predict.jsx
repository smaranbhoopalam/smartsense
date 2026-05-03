import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import SimulationPanel from "../components/SimulationPanel";

// ── Unit conversion helpers ───────────────────────────────────────────────────
const toMetres = (val, unit) => {
  const v = parseFloat(val);
  if (isNaN(v) || v <= 0) return 0;
  if (unit === "m")   return v;
  if (unit === "cm")  return v / 100;
  if (unit === "ft")  return v * 0.3048;
  return v;
};

const toKg = (val, unit) => {
  const v = parseFloat(val);
  if (isNaN(v) || v <= 0) return 0;
  return unit === "lbs" ? v * 0.453592 : v;
};

// Compute sleep duration in hours from bed/wake times
// Returns null if either time is missing
const calcSleepHours = (bedTime, wakeTime) => {
  if (!bedTime || !wakeTime) return null;
  const [bh, bm] = bedTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let bedMins  = bh * 60 + bm;
  let wakeMins = wh * 60 + wm;
  // If wake is earlier than bed, sleep crosses midnight
  if (wakeMins <= bedMins) wakeMins += 24 * 60;
  return Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
};

const defaultForm = {
  age: 30,
  Gender: "Male",
  // Height stored as display value; unit tracked separately
  heightVal: 175,
  heightUnit: "cm",
  // Weight stored as display value; unit tracked separately
  weightVal: 70,
  weightUnit: "kg",
  // Sleep via bed/wake time
  bedTime: "22:30",
  wakeTime: "06:30",
  physical_activity: "Moderate",
  stress_level: 5,
  Diet_quality: "Average",
  sugar_intake: "Low",
  salt_intake: "Low",
  Smoking_habit: "Non-smoker",
  Alcohol_consumption: "None",
  is_diabetic: false,
  // Optional medical
  Pregnancies: "",
  Glucose: "",
  BloodPressure: "",
  SkinThickness: "",
  Insulin: "",
  DiabetesPedigreeFunction: "",
  steps_per_day: "",
  heart_rate: "",
};

const inputCls = "bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors w-full";
const optInputCls = "bg-slate-900 border border-slate-600 border-dashed p-3 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors w-full placeholder-slate-600";
const selectCls = "bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none w-full";

function Field({ label, optional, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-400 text-sm font-bold flex items-center gap-2">
        {label}
        {optional && <span className="text-xs text-slate-600 font-normal border border-slate-700 px-1.5 py-0.5 rounded">optional</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ num, title, subtitle }) {
  return (
    <div className="border-b border-emerald-500/20 pb-2 mb-5">
      <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-widest">
        {num}. {title}
      </h3>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

const DISEASE_META = {
  type2_diabetes:  { label: "Type-2 Diabetes",       color: "blue",   icon: "🩸" },
  hypertension:    { label: "Hypertension",           color: "red",    icon: "❤️" },
  cardiovascular:  { label: "Cardiovascular Disease", color: "orange", icon: "🫀" },
  obesity:         { label: "Obesity",                color: "yellow", icon: "⚖️" },
};

const colorBar = {
  blue:   { bar: "bg-blue-500",   text: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/10" },
  red:    { bar: "bg-red-500",    text: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/10" },
  orange: { bar: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10" },
  yellow: { bar: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
};

function DiseaseCard({ diseaseKey, value, simValue }) {
  const meta = DISEASE_META[diseaseKey];
  const c = colorBar[meta.color];
  const risk = value >= 50 ? "High" : value >= 25 ? "Moderate" : "Low";
  const riskColor = value >= 50 ? "text-red-400" : value >= 25 ? "text-yellow-400" : "text-emerald-400";
  const improved = simValue !== undefined ? (value - simValue).toFixed(1) : null;

  return (
    <div className={`p-5 rounded-2xl border ${c.border} ${c.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <span className="text-white font-bold text-sm">{meta.label}</span>
        </div>
        <span className={`text-2xl font-black ${c.text}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
        <div className={`${c.bar} h-2 rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${riskColor}`}>{risk} Risk</span>
        {improved !== null && (
          <span className="text-xs text-emerald-400 font-bold">↓ {improved}% with better habits</span>
        )}
      </div>
    </div>
  );
}

function RoadmapDisplay({ text }) {
  // Convert **bold** markdown to styled spans
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const isBold = line.startsWith("**");
        const clean = line.replace(/\*\*/g, "");
        return (
          <p key={i} className={isBold ? "text-emerald-400 font-bold mt-3" : "text-slate-300 text-sm leading-relaxed pl-2"}>
            {clean}
          </p>
        );
      })}
    </div>
  );
}

export default function Predict() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [simBase, setSimBase] = useState(null);

  const [showStressAI, setShowStressAI] = useState(false);
  const [stressText, setStressText] = useState("");
  const [stressAILoading, setStressAILoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Derived: height in metres, weight in kg, sleep in hours
  const heightM   = useMemo(() => toMetres(form.heightVal, form.heightUnit), [form.heightVal, form.heightUnit]);
  const weightKg  = useMemo(() => toKg(form.weightVal, form.weightUnit),     [form.weightVal, form.weightUnit]);
  const sleepHrs  = useMemo(() => calcSleepHours(form.bedTime, form.wakeTime), [form.bedTime, form.wakeTime]);
  const bmi       = useMemo(() => {
    if (heightM > 0 && weightKg > 0) return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    return null;
  }, [heightM, weightKg]);

  const buildPayload = () => {
    const payload = {
      ...form,
      Height: heightM,
      Weight: weightKg,
      sleep_duration: sleepHrs ?? 7,
    };
    // Remove UI-only fields
    delete payload.heightVal; delete payload.heightUnit;
    delete payload.weightVal; delete payload.weightUnit;
    delete payload.bedTime;   delete payload.wakeTime;
    // Convert empty strings to null for optional fields
    ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "DiabetesPedigreeFunction", "steps_per_day", "heart_rate"].forEach((k) => {
      if (payload[k] === "" || payload[k] === 0) payload[k] = null;
      else if (payload[k] !== null) payload[k] = parseFloat(payload[k]);
    });
    return payload;
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSimResult(null);
    setRoadmap(null);
    try {
      const res = await api.predict(buildPayload());
      if (res.status === "Success") {
        setResult(res);
        setSimBase(buildPayload()); // seed the live simulation panel
      } else {
        setError(res.message || "Prediction failed.");
      }
    } catch {
      setError("Cannot connect to backend. Make sure it's running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await api.getRoadmap(buildPayload());
      if (res.status === "Success") setRoadmap(res.roadmap);
    } catch {
      setRoadmap("Could not generate roadmap. Please try again.");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleStressAI = async () => {
    if (!stressText.trim()) return;
    setStressAILoading(true);
    try {
      const res = await api.calculateStress(stressText);
      if (res.status === "Success") {
        setForm(p => ({ ...p, stress_level: res.stress_level }));
        setShowStressAI(false);
        setStressText("");
      } else {
        alert(res.message);
      }
    } catch {
      alert("AI failed to calculate stress. Ensure backend is running.");
    } finally {
      setStressAILoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-2 text-white text-center">Health Risk Prediction</h1>
        <p className="text-slate-400 text-center mb-10">Fill in your details — medical fields are optional. The AI will work with what you provide.</p>

        <div className="bg-slate-800/40 rounded-3xl border border-emerald-500/20 p-8 md:p-10 space-y-10">

          {/* ── SECTION 1: PHYSICAL ── */}
          <div>
            <SectionTitle num="01" title="Physical Metrics" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Age">
                <input type="number" className={inputCls} value={form.age} onChange={(e) => set("age", +e.target.value)} />
              </Field>
              <Field label="Gender">
                <select className={selectCls} value={form.Gender} onChange={(e) => set("Gender", e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>

              {/* Height with unit switcher */}
              <Field label="Height">
                <div className="flex gap-2">
                  <input
                    type="number" step="0.1"
                    className={inputCls}
                    value={form.heightVal}
                    onChange={(e) => set("heightVal", e.target.value)}
                    placeholder={form.heightUnit === "cm" ? "e.g. 175" : form.heightUnit === "m" ? "e.g. 1.75" : "e.g. 5.9"}
                  />
                  <select
                    className="bg-slate-900 border border-slate-700 px-2 rounded-xl text-emerald-400 font-bold text-sm outline-none focus:border-emerald-500 flex-shrink-0"
                    value={form.heightUnit}
                    onChange={(e) => {
                      // Convert current value to new unit
                      const currentM = toMetres(form.heightVal, form.heightUnit);
                      let newVal = currentM;
                      if (e.target.value === "cm") newVal = Math.round(currentM * 100);
                      else if (e.target.value === "ft") newVal = Math.round((currentM / 0.3048) * 10) / 10;
                      else newVal = Math.round(currentM * 100) / 100;
                      set("heightUnit", e.target.value);
                      set("heightVal", newVal);
                    }}
                  >
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </Field>

              {/* Weight with unit switcher */}
              <Field label="Weight">
                <div className="flex gap-2">
                  <input
                    type="number" step="0.1"
                    className={inputCls}
                    value={form.weightVal}
                    onChange={(e) => set("weightVal", e.target.value)}
                    placeholder={form.weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
                  />
                  <select
                    className="bg-slate-900 border border-slate-700 px-2 rounded-xl text-emerald-400 font-bold text-sm outline-none focus:border-emerald-500 flex-shrink-0"
                    value={form.weightUnit}
                    onChange={(e) => {
                      const currentKg = toKg(form.weightVal, form.weightUnit);
                      const newVal = e.target.value === "lbs"
                        ? Math.round(currentKg * 2.20462 * 10) / 10
                        : Math.round(currentKg * 10) / 10;
                      set("weightUnit", e.target.value);
                      set("weightVal", newVal);
                    }}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </Field>
            </div>

            {/* BMI display */}
            {bmi > 0 && (
              <div className="mt-4 inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
                <span className="text-slate-400 text-sm">Auto-calculated BMI:</span>
                <span className={`text-lg font-black ${bmi > 30 ? "text-red-400" : bmi > 25 ? "text-yellow-400" : "text-emerald-400"}`}>{bmi}</span>
                <span className="text-slate-500 text-xs">{bmi > 30 ? "Obese" : bmi > 25 ? "Overweight" : bmi > 18.5 ? "Normal" : "Underweight"}</span>
              </div>
            )}
          </div>

          {/* ── SECTION 2: LIFESTYLE ── */}
          <div>
            <SectionTitle num="02" title="Lifestyle & Habits" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

              {/* Bed time */}
              <Field label="Bed Time">
                <input
                  type="time"
                  className={inputCls}
                  value={form.bedTime}
                  onChange={(e) => set("bedTime", e.target.value)}
                />
              </Field>

              {/* Wake time */}
              <Field label="Wake Up Time">
                <input
                  type="time"
                  className={inputCls}
                  value={form.wakeTime}
                  onChange={(e) => set("wakeTime", e.target.value)}
                />
              </Field>

              {/* Computed sleep duration display */}
              <Field label="Sleep Duration">
                <div className={`${inputCls} flex items-center justify-between cursor-default`}>
                  {sleepHrs !== null ? (
                    <>
                      <span className={`font-black text-lg ${sleepHrs < 6 ? "text-red-400" : sleepHrs > 9 ? "text-yellow-400" : "text-emerald-400"}`}>
                        {sleepHrs} hrs
                      </span>
                      <span className="text-slate-500 text-xs">
                        {sleepHrs < 6 ? "Too little" : sleepHrs > 9 ? "Too much" : "Healthy"}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-600 text-sm">Set times above</span>
                  )}
                </div>
              </Field>

              <Field label="Steps (per day)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 5000" value={form.steps_per_day} onChange={(e) => set("steps_per_day", e.target.value)} />
              </Field>

              <Field label="Heart Rate (bpm)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 70" value={form.heart_rate} onChange={(e) => set("heart_rate", e.target.value)} />
              </Field>

              <Field label="Physical Activity">
                <select className={selectCls} value={form.physical_activity} onChange={(e) => set("physical_activity", e.target.value)}>
                  <option>Sedentary</option><option>Moderate</option><option>Active</option>
                </select>
              </Field>
              <Field label={`Stress: ${form.stress_level}/10`}>
                <div className="pt-3">
                  <input type="range" min="1" max="10" className="w-full accent-emerald-500" value={form.stress_level} onChange={(e) => set("stress_level", +e.target.value)} />
                  <div className="flex justify-between text-xs text-slate-600 mt-1 mb-2"><span>Low</span><span>High</span></div>
                  <button type="button" onClick={() => setShowStressAI(true)} className="text-xs border border-emerald-500/50 px-3 py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 w-full transition-all mt-2 text-center shadow-md shadow-emerald-500/10 flex flex-col items-center gap-1.5 focus:ring-2 focus:ring-emerald-500">
                    <span className="text-slate-400 font-medium">Unable to determine your stress? That's fine.</span>
                    <span className="text-emerald-400 font-bold underline decoration-emerald-500/50 underline-offset-4">Click here for the AI to calculate your stress!</span>
                  </button>
                </div>
              </Field>
              <Field label="Diet Quality">
                <select className={selectCls} value={form.Diet_quality} onChange={(e) => set("Diet_quality", e.target.value)}>
                  <option>Poor</option><option>Average</option><option>Good</option>
                </select>
              </Field>
              <Field label="Sugar Intake">
                <select className={selectCls} value={form.sugar_intake} onChange={(e) => set("sugar_intake", e.target.value)}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </Field>
              <Field label="Salt Intake">
                <select className={selectCls} value={form.salt_intake} onChange={(e) => set("salt_intake", e.target.value)}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </Field>
              <Field label="Smoking">
                <select className={selectCls} value={form.Smoking_habit} onChange={(e) => set("Smoking_habit", e.target.value)}>
                  <option>Non-smoker</option><option>Occasional</option><option>Regular</option>
                </select>
              </Field>
              <Field label="Alcohol">
                <select className={selectCls} value={form.Alcohol_consumption} onChange={(e) => set("Alcohol_consumption", e.target.value)}>
                  <option>None</option><option>Occasional</option><option>Regular</option>
                </select>
              </Field>
            </div>
          </div>

          {/* ── SECTION 3: MEDICAL (OPTIONAL) ── */}
          <div>
            <SectionTitle
              num="03"
              title="Medical Laboratory Data"
              subtitle="All fields below are optional. Leave blank if you don't have the values — we'll use population averages."
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Glucose (mg/dL)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 120" value={form.Glucose} onChange={(e) => set("Glucose", e.target.value)} />
              </Field>
              <Field label="Blood Pressure (mmHg)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 80" value={form.BloodPressure} onChange={(e) => set("BloodPressure", e.target.value)} />
              </Field>
              <Field label="Skin Thickness (mm)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 20" value={form.SkinThickness} onChange={(e) => set("SkinThickness", e.target.value)} />
              </Field>
              <Field label="Insulin (μU/mL)" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 79" value={form.Insulin} onChange={(e) => set("Insulin", e.target.value)} />
              </Field>
              <Field label="Diabetes Pedigree" optional>
                <input type="number" step="0.01" className={optInputCls} placeholder="e.g. 0.5" value={form.DiabetesPedigreeFunction} onChange={(e) => set("DiabetesPedigreeFunction", e.target.value)} />
              </Field>
              <Field label="Pregnancies" optional>
                <input type="number" className={optInputCls} placeholder="e.g. 0" value={form.Pregnancies} onChange={(e) => set("Pregnancies", e.target.value)} />
              </Field>
              <Field label="Known Diabetic?">
                <button
                  type="button"
                  onClick={() => set("is_diabetic", !form.is_diabetic)}
                  className={`p-3 rounded-xl font-bold transition-all border w-full ${
                    form.is_diabetic
                      ? "bg-red-500/20 text-red-400 border-red-500"
                      : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  {form.is_diabetic ? "YES — Diabetic" : "NO — Not Diabetic"}
                </button>
              </Field>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black py-5 rounded-2xl text-xl transition-all shadow-xl shadow-emerald-500/20"
          >
            {loading ? "Analyzing your health data..." : "Predict My Health Risk"}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-center font-bold text-sm">
              {error}
            </div>
          )}

          {/* ── RESULTS ── */}
          {result && (
            <div className="space-y-8">

              {/* Score row */}
              <div className="grid md:grid-cols-3 gap-5">
                <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">AI Diabetes Risk</p>
                  <p className="text-5xl font-black text-emerald-400">{result.ai_risk}</p>
                  <p className={`text-sm font-bold mt-2 ${parseFloat(result.ai_risk) >= 50 ? "text-red-400" : parseFloat(result.ai_risk) >= 20 ? "text-yellow-400" : "text-emerald-400"}`}>
                    {parseFloat(result.ai_risk) >= 50 ? "High Risk" : parseFloat(result.ai_risk) >= 20 ? "Moderate Risk" : "Low Risk"}
                  </p>
                </div>
                <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">Overall Health Score</p>
                  <p className="text-5xl font-black text-white">{result.health_score}<span className="text-2xl text-slate-500">/100</span></p>
                  <p className={`text-sm font-bold mt-2 ${result.health_score >= 85 ? "text-emerald-400" : result.health_score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                    {result.health_score >= 85 ? "Good" : result.health_score >= 60 ? "Moderate" : "Needs Attention"}
                  </p>
                </div>
                <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">Your BMI</p>
                  <p className="text-5xl font-black text-white">{result.bmi}</p>
                  <p className={`text-sm font-bold mt-2 ${result.bmi > 30 ? "text-red-400" : result.bmi > 25 ? "text-yellow-400" : "text-emerald-400"}`}>
                    {result.bmi > 30 ? "Obese" : result.bmi > 25 ? "Overweight" : result.bmi > 18.5 ? "Normal" : "Underweight"}
                  </p>
                </div>
              </div>

              {/* Disease risks */}
              {result.disease_risks && (
                <div>
                  <p className="text-white font-bold mb-4">Disease Risk Breakdown</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(result.disease_risks).map(([key, val]) => (
                      <DiseaseCard
                        key={key}
                        diseaseKey={key}
                        value={val}
                        simValue={simResult?.simulated?.disease_risks?.[key]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Risk factors */}
              {result.explanations?.length > 0 && (
                <div className="p-5 bg-slate-900 border border-emerald-500/20 rounded-2xl">
                  <p className="text-emerald-400 font-bold mb-3 text-xs uppercase tracking-widest">Key Risk Factors</p>
                  <ul className="space-y-2">
                    {result.explanations.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">→</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Roadmap button — kept, simulation moved to panel below */}
              <div className="border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-5 bg-slate-900 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">AI Health Roadmap</p>
                    <p className="text-slate-500 text-sm">Personalised 4-week plan powered by Gemini AI</p>
                  </div>
                  <button
                    onClick={handleRoadmap}
                    disabled={roadmapLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold py-2 px-5 rounded-xl text-sm transition-all"
                  >
                    {roadmapLoading ? "Generating..." : roadmap ? "Regenerate" : "Generate Roadmap"}
                  </button>
                </div>
                {roadmap && (
                  <div className="p-6 bg-slate-800/50 border-t border-slate-700">
                    <RoadmapDisplay text={roadmap} />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── LIVE SIMULATION PANEL ── always visible once form has data ── */}
      <div className="mt-8">
        <SimulationPanel baseData={simBase || buildPayload()} />
      </div>


      {showStressAI && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-white font-black text-xl mb-1 flex items-center gap-2">🤖 AI Stress Evaluation</h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Briefly describe your recent sleep schedule, workload, and overall mood. LifeGuard.AI will accurately determine your stress score (1-10) for your profile.
            </p>
            <textarea
              className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-emerald-500 w-full min-h-[120px] transition-all resize-none text-sm placeholder-slate-600"
              placeholder="e.g. I have been working 12 hour shifts, sleeping only 5 hours a night. I feel completely overwhelmed and tired."
              value={stressText}
              onChange={(e) => setStressText(e.target.value)}
            />
            <div className="flex justify-end items-center gap-3 mt-5">
              <button 
                disabled={stressAILoading} 
                onClick={() => setShowStressAI(false)} 
                className="text-slate-400 text-sm font-bold hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={stressAILoading || !stressText.trim()} 
                onClick={handleStressAI} 
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                {stressAILoading ? "Analyzing Profile..." : "Calculate Score →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
