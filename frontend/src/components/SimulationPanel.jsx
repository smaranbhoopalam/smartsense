import { useState, useEffect, useCallback } from "react";
import { calcBmi, calcHealthScore, calcDiseaseRisks } from "../utils/scoring";

const DISEASE_META = {
  type2_diabetes: { label: "Type-2 Diabetes", icon: "🩸", color: "blue" },
  hypertension:   { label: "Hypertension",    icon: "❤️",  color: "red" },
  cardiovascular: { label: "Cardiovascular",  icon: "🫀",  color: "orange" },
  obesity:        { label: "Obesity",         icon: "⚖️",  color: "yellow" },
};

const BAR = {
  blue:   "bg-blue-500",
  red:    "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
};

const TEXT = {
  blue:   "text-blue-400",
  red:    "text-red-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
};

function ScoreRing({ score, size = 96 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease" }}
      />
      <text x="48" y="53" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{score}</text>
    </svg>
  );
}

function DeltaBadge({ original, simulated }) {
  if (original === null || original === undefined) return null;
  const delta = simulated - original;
  if (delta === 0) return <span className="text-xs text-slate-500">no change</span>;
  const better = delta < 0; // lower disease risk = better; higher health score = better handled separately
  return (
    <span className={`text-xs font-bold ${better ? "text-emerald-400" : "text-red-400"}`}>
      {better ? "↓" : "↑"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

function ScoreDelta({ original, simulated }) {
  if (original === null || original === undefined) return null;
  const delta = simulated - original;
  if (delta === 0) return <span className="text-xs text-slate-500">no change</span>;
  const better = delta > 0; // higher health score = better
  return (
    <span className={`text-sm font-bold ${better ? "text-emerald-400" : "text-red-400"}`}>
      {better ? "+" : ""}{delta} pts
    </span>
  );
}

// Slider row with live value display
function SimSlider({ label, field, min, max, step = 1, unit = "", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-slate-400 text-xs font-bold">{label}</label>
        <span className="text-emerald-400 text-xs font-black">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(field, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full accent-emerald-500 h-1.5"
      />
      <div className="flex justify-between text-slate-700 text-xs">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function SimSelect({ label, field, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-slate-400 text-xs font-bold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-xs focus:border-emerald-500 outline-none"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function SimulationPanel({ baseData }) {
  // Initialise sim state from baseData, only the parameters the user can change
  const initSim = useCallback((d) => ({
    age:              d.age || 30,
    Height:           d.Height || 1.75,
    Weight:           d.Weight || 70,
    sleep_duration:   parseFloat(d.sleep_duration) || 7,
    steps_per_day:    parseInt(d.steps_per_day) || 5000,
    physical_activity: d.physical_activity || "Moderate",
    stress_level:     parseInt(d.stress_level) || 5,
    sugar_intake:     d.sugar_intake || "Low",
    salt_intake:      d.salt_intake || "Low",
    Smoking_habit:    d.Smoking_habit || "Non-smoker",
    Alcohol_consumption: d.Alcohol_consumption || "None",
    Diet_quality:     d.Diet_quality || "Average",
    // Medical (optional, kept from base)
    Glucose:          d.Glucose || null,
    BloodPressure:    d.BloodPressure || null,
    Insulin:          d.Insulin || null,
    DiabetesPedigreeFunction: d.DiabetesPedigreeFunction || null,
    is_diabetic:      d.is_diabetic || false,
  }), []);

  const [sim, setSim] = useState(() => initSim(baseData || {}));

  // Reset when baseData changes (user submits a new prediction)
  useEffect(() => {
    if (baseData) setSim(initSim(baseData));
  }, [baseData, initSim]);

  const setField = (field, value) => {
    if (field === "Height") return; // Height is immutable in simulation
    setSim((p) => ({ ...p, [field]: value }));
  };

  // Compute BMI from sim height/weight
  const simBmi = calcBmi(sim.Weight, sim.Height);
  const simData = { ...sim, BMI: simBmi };

  // Base scores (from original baseData)
  const baseBmi = baseData ? calcBmi(baseData.Weight || 70, baseData.Height || 1.75) : null;
  const baseDataWithBmi = baseData ? { ...baseData, BMI: baseBmi } : null;
  const { score: baseScore } = baseDataWithBmi ? calcHealthScore(baseDataWithBmi) : { score: null };
  const baseRisks = baseDataWithBmi ? calcDiseaseRisks(baseDataWithBmi) : null;

  // Live sim scores
  const { score: simScore, reasons: simReasons } = calcHealthScore(simData);
  const simRisks = calcDiseaseRisks(simData);

  const scoreDelta = baseScore !== null ? simScore - baseScore : null;

  return (
    <div className="bg-slate-800/60 border border-emerald-500/20 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-lg">Live Simulation Engine</h2>
          <p className="text-slate-500 text-xs mt-0.5">Adjust parameters below — scores update instantly</p>
        </div>
        <button
          onClick={() => baseData && setSim(initSim(baseData))}
          className="text-xs text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all"
        >
          Reset
        </button>
      </div>

      <div className="p-6 grid lg:grid-cols-3 gap-6">

        {/* ── LEFT: SLIDERS ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Physical */}
          <div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Physical</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SimSlider label="Weight (kg)" field="Weight" min={40} max={150} step={0.5} unit=" kg" value={sim.Weight} onChange={setField} />
              {/* Height is fixed — cannot be changed in simulation */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
                    Height (m)
                    <span className="text-xs text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">fixed</span>
                  </label>
                  <span className="text-slate-500 text-xs font-black">{sim.Height} m</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 opacity-40 cursor-not-allowed" />
                <p className="text-slate-600 text-xs">Height stays as entered</p>
              </div>
            </div>
            {simBmi > 0 && (
              <p className="text-xs mt-2 text-slate-500">
                BMI: <span className={`font-bold ${simBmi > 30 ? "text-red-400" : simBmi > 25 ? "text-yellow-400" : "text-emerald-400"}`}>{simBmi}</span>
                <span className="ml-1 text-slate-600">({simBmi > 30 ? "Obese" : simBmi > 25 ? "Overweight" : simBmi > 18.5 ? "Normal" : "Underweight"})</span>
              </p>
            )}
          </div>

          {/* Lifestyle */}
          <div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Lifestyle</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <SimSlider label="Sleep (hrs)"   field="sleep_duration" min={3} max={12} step={0.5} unit=" hrs" value={sim.sleep_duration} onChange={setField} />
              <SimSlider label={`Stress: ${sim.stress_level}/10`} field="stress_level" min={1} max={10} value={sim.stress_level} onChange={setField} />
              <SimSlider label="Steps/day" field="steps_per_day" min={0} max={20000} step={500} value={sim.steps_per_day} onChange={setField} />
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
              <SimSelect label="Physical Activity" field="physical_activity" options={["Sedentary", "Moderate", "Active"]} value={sim.physical_activity} onChange={setField} />
              <SimSelect label="Diet Quality"      field="Diet_quality"      options={["Poor", "Average", "Good"]}          value={sim.Diet_quality}      onChange={setField} />
              <SimSelect label="Sugar Intake"      field="sugar_intake"      options={["Low", "Medium", "High"]}            value={sim.sugar_intake}      onChange={setField} />
              <SimSelect label="Salt Intake"       field="salt_intake"       options={["Low", "Medium", "High"]}            value={sim.salt_intake}       onChange={setField} />
              <SimSelect label="Smoking"           field="Smoking_habit"     options={["Non-smoker", "Occasional", "Regular"]} value={sim.Smoking_habit}  onChange={setField} />
              <SimSelect label="Alcohol"           field="Alcohol_consumption" options={["None", "Occasional", "Regular"]}  value={sim.Alcohol_consumption} onChange={setField} />
            </div>
          </div>

          {/* Optional medical sliders — only show if base had values */}
          {(baseData?.Glucose || baseData?.BloodPressure) && (
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Medical (optional)</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {baseData?.Glucose && (
                  <SimSlider label="Glucose (mg/dL)" field="Glucose" min={60} max={300} value={sim.Glucose ?? 100} onChange={setField} />
                )}
                {baseData?.BloodPressure && (
                  <SimSlider label="Blood Pressure" field="BloodPressure" min={50} max={180} value={sim.BloodPressure ?? 80} onChange={setField} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: LIVE SCORES ── */}
        <div className="space-y-5">

          {/* Health score ring */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-700 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Health Score</p>
            <div className="flex items-center justify-center gap-4">
              {baseScore !== null && (
                <div className="text-center opacity-50">
                  <ScoreRing score={baseScore} size={72} />
                  <p className="text-slate-500 text-xs mt-1">Current</p>
                </div>
              )}
              <div className="text-center">
                <ScoreRing score={simScore} size={96} />
                <p className="text-slate-400 text-xs mt-1">Simulated</p>
              </div>
            </div>
            {scoreDelta !== null && (
              <div className="mt-3">
                <ScoreDelta original={baseScore} simulated={simScore} />
              </div>
            )}
            <p className={`text-xs font-bold mt-2 ${simScore >= 85 ? "text-emerald-400" : simScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
              {simScore >= 85 ? "Good" : simScore >= 60 ? "Moderate" : "Needs Attention"}
            </p>
          </div>

          {/* Disease risks */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-700 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-widest">Disease Risks</p>
            {Object.entries(simRisks).map(([key, val]) => {
              const meta = DISEASE_META[key];
              const baseVal = baseRisks?.[key] ?? null;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-xs">{meta.icon} {meta.label}</span>
                    <div className="flex items-center gap-2">
                      <DeltaBadge original={baseVal} simulated={val} />
                      <span className={`text-xs font-black ${TEXT[meta.color]}`}>{val}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`${BAR[meta.color]} h-1.5 rounded-full`}
                      style={{ width: `${Math.min(val, 100)}%`, transition: "width 0.3s ease" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key factors */}
          {simReasons.length > 0 && simReasons[0] !== "Excellent health markers!" && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Active Risk Factors</p>
              <ul className="space-y-1.5">
                {simReasons.slice(0, 4).map((r, i) => (
                  <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {simReasons[0] === "Excellent health markers!" && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
              <p className="text-emerald-400 text-sm font-bold">✓ Excellent health markers!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
