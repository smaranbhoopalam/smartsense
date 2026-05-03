// Mirror of backend/logic/calculator.py — kept in sync manually.
// All scoring is done client-side so the simulation panel updates instantly.

function safe(data, key) {
  const v = data[key];
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

export function calcBmi(weight, height) {
  if (!height || height <= 0) return 0;
  return Math.round((weight / (height * height)) * 10) / 10;
}

export function calcHealthScore(data) {
  let score = 100;
  const reasons = [];

  const age = parseInt(data.age) || 25;
  if (age > 50) { score -= 10; reasons.push("Age-related risk factor"); }

  const bmi = safe(data, "BMI");
  if (bmi) {
    if (bmi > 30)      { score -= 15; reasons.push("BMI in Obese range"); }
    else if (bmi > 25) { score -= 8;  reasons.push("BMI in Overweight range"); }
  }

  const glucose = safe(data, "Glucose");
  if (glucose !== null) {
    if (glucose > 125)      { score -= 20; reasons.push("Elevated Blood Sugar"); }
    else if (glucose > 100) { score -= 10; reasons.push("Borderline Blood Sugar"); }
  }

  const bp = safe(data, "BloodPressure");
  if (bp !== null && bp > 90) { score -= 15; reasons.push("High Blood Pressure"); }

  const insulin = safe(data, "Insulin");
  if (insulin !== null && insulin > 150) { score -= 10; reasons.push("High Insulin Levels"); }

  const pedigree = safe(data, "DiabetesPedigreeFunction");
  if (pedigree !== null && pedigree > 0.5) { score -= 10; reasons.push("Genetic Risk Factor (Pedigree)"); }

  if (data.is_diabetic === true) { score -= 15; reasons.push("Existing Diabetic Condition"); }

  if (data.physical_activity === "Sedentary") { score -= 10; reasons.push("Low Physical Activity"); }

  const stress = safe(data, "stress_level");
  if (stress && stress > 7) { score -= 8; reasons.push("High Stress Levels"); }

  const sleep = safe(data, "sleep_duration");
  if (sleep && sleep < 6) { score -= 7; reasons.push("Poor Sleep Duration"); }

  if (data.sugar_intake === "High")          { score -= 10; reasons.push("High Dietary Sugar"); }
  if (data.Smoking_habit === "Regular")      { score -= 12; reasons.push("Regular Smoking"); }
  if (data.Alcohol_consumption === "Regular"){ score -= 8;  reasons.push("Regular Alcohol Intake"); }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons: reasons.length ? reasons : ["Excellent health markers!"],
  };
}

export function calcDiseaseRisks(data) {
  const age      = parseInt(data.age) || 25;
  const bmi      = safe(data, "BMI")    ?? 22;
  const glucose  = safe(data, "Glucose") ?? 90;
  const bp       = safe(data, "BloodPressure") ?? 70;
  const pedigree = safe(data, "DiabetesPedigreeFunction") ?? 0.3;
  const stress   = safe(data, "stress_level") ?? 5;
  const smoking  = data.Smoking_habit || "Non-smoker";
  const alcohol  = data.Alcohol_consumption || "None";
  const activity = data.physical_activity || "Moderate";
  const sugar    = data.sugar_intake || "Low";
  const salt     = data.salt_intake || "Low";
  const isDiabetic = data.is_diabetic === true;

  // Type-2 Diabetes
  let d2 = 5;
  if (glucose > 125) d2 += 35; else if (glucose > 100) d2 += 18;
  if (bmi > 30) d2 += 20; else if (bmi > 25) d2 += 10;
  if (pedigree > 0.5) d2 += 15;
  if (age > 45) d2 += 10;
  if (sugar === "High") d2 += 8;
  if (activity === "Sedentary") d2 += 7;
  if (isDiabetic) d2 = Math.max(d2, 80);

  // Hypertension
  let ht = 5;
  if (bp > 130) ht += 40; else if (bp > 110) ht += 20;
  if (bmi > 30) ht += 15;
  if (salt === "High") ht += 12;
  if (stress > 7) ht += 10;
  if (smoking === "Regular") ht += 10;
  if (alcohol === "Regular") ht += 8;
  if (age > 50) ht += 10;

  // Cardiovascular
  let cv = 5;
  if (smoking === "Regular") cv += 25; else if (smoking === "Occasional") cv += 10;
  if (bmi > 30) cv += 15;
  if (bp > 130) cv += 15;
  if (glucose > 125) cv += 10;
  if (alcohol === "Regular") cv += 8;
  if (activity === "Sedentary") cv += 10;
  if (age > 50) cv += 12;
  if (stress > 7) cv += 5;

  // Obesity
  let ob = 5;
  if (bmi > 35) ob += 60; else if (bmi > 30) ob += 40; else if (bmi > 25) ob += 20;
  if (activity === "Sedentary") ob += 15;
  if (sugar === "High") ob += 10;
  if (alcohol === "Regular") ob += 8;
  if (age > 40) ob += 5;

  const cap = (v) => Math.round(Math.min(v, 97) * 10) / 10;
  return {
    type2_diabetes: cap(d2),
    hypertension:   cap(ht),
    cardiovascular: cap(cv),
    obesity:        cap(ob),
  };
}
