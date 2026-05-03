// In production, set VITE_API_URL to your Railway backend URL
// e.g. https://lifeguard-backend.up.railway.app
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  predict: (data) =>
    fetch(`${BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  simulate: (data) =>
    fetch(`${BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  loginGoogle: (googleData) =>
    fetch(`${BASE}/login/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleData),
    }).then((r) => r.json()),

  getProfile: (googleId) =>
    fetch(`${BASE}/profile/google/${googleId}`).then((r) => r.json()),

  updateProfile: (email, data) =>
    fetch(`${BASE}/profile/${email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getAiTip: (googleId) =>
    fetch(`${BASE}/ai-tip/${googleId}`).then((r) => r.json()),

  getDashboard: (googleId) =>
    fetch(`${BASE}/dashboard/${googleId}`).then((r) => r.json()),

  voiceCommand: (text) =>
    fetch(`${BASE}/voice-command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),

  nearbyHospitals: (lat, lng) =>
    fetch(`${BASE}/nearby-hospitals?lat=${lat}&lng=${lng}`).then((r) => r.json()),

  getRoadmap: (data) =>
    fetch(`${BASE}/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  calculateStress: (text) =>
    fetch(`${BASE}/calculate-stress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),
};
