import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [aiTip, setAiTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipLoading, setTipLoading] = useState(false);

  const googleId = user?.google_id || user?.sub;

  useEffect(() => {
    if (!googleId) { setLoading(false); return; }
    api.getDashboard(googleId)
      .then((res) => {
        if (res.status === "Success") setHistory(res.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [googleId]);

  const fetchTip = async () => {
    if (!googleId) return;
    setTipLoading(true);
    try {
      const res = await api.getAiTip(googleId);
      if (res.status === "Success") setAiTip(res.ai_tip);
    } catch {
      setAiTip("Stay active and hydrated today!");
    } finally {
      setTipLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-slate-400 text-xl mb-6">You need to be logged in to view your dashboard.</p>
          <Link to="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-8 rounded-2xl transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const avgRisk = history.length
    ? (history.reduce((s, h) => s + (parseFloat(h.score) || 0), 0) / history.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <img
            src={user.picture || user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.name || "U")}&background=10b981&color=fff`}
            alt="avatar"
            className="w-16 h-16 rounded-full border-2 border-emerald-500"
          />
          <div>
            <h1 className="text-3xl font-black text-white">Welcome back, {user.full_name || user.name}</h1>
            <p className="text-slate-400">{user.email}</p>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-slate-400 text-sm mb-1">Total Predictions</p>
            <p className="text-4xl font-black text-emerald-400">{history.length}</p>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-slate-400 text-sm mb-1">Avg Risk Score</p>
            <p className="text-4xl font-black text-white">{avgRisk ?? "—"}{avgRisk ? "%" : ""}</p>
          </div>
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center">
            <p className="text-slate-400 text-sm mb-1">Daily Calorie Goal</p>
            <p className="text-4xl font-black text-white">{user.daily_calorie_goal ?? "—"}</p>
          </div>
        </div>

        {/* AI TIP */}
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest">AI Health Tip</p>
            <button
              onClick={fetchTip}
              disabled={tipLoading}
              className="text-sm text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 px-4 py-1.5 rounded-full transition-all disabled:opacity-50"
            >
              {tipLoading ? "Loading..." : "Get My Tip"}
            </button>
          </div>
          {aiTip ? (
            <p className="text-slate-200 leading-relaxed">{aiTip}</p>
          ) : (
            <p className="text-slate-500 italic">Click "Get My Tip" to receive personalized advice from Gemini AI.</p>
          )}
        </div>

        {/* HISTORY */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Prediction History</h2>
          {loading ? (
            <div className="text-slate-400 text-center py-12">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700">
              <p className="text-slate-400 mb-4">No predictions yet.</p>
              <Link to="/predict" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-8 rounded-2xl transition-all">
                Run Your First Prediction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => {
                const risk = parseFloat(h.score) || 0;
                const color = risk >= 50 ? "text-red-400" : risk >= 30 ? "text-yellow-400" : "text-emerald-400";
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <div>
                      <p className="text-white font-semibold">{h.risk || "Prediction"}</p>
                      <p className="text-slate-500 text-sm">{h.date ? new Date(h.date).toLocaleDateString() : "—"}</p>
                    </div>
                    <p className={`text-2xl font-black ${color}`}>{h.score ?? "—"}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link to="/predict" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-8 rounded-2xl transition-all">
            New Prediction
          </Link>
          <Link to="/hospitals" className="border border-slate-700 hover:border-emerald-500/40 text-slate-300 font-bold py-3 px-8 rounded-2xl transition-all">
            Find Hospitals
          </Link>
          <Link to="/profile" className="border border-slate-700 hover:border-emerald-500/40 text-slate-300 font-bold py-3 px-8 rounded-2xl transition-all">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
