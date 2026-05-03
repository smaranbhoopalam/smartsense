import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Link } from "react-router-dom";

const inputCls = "bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none transition-colors w-full";
const selectCls = "bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-emerald-500 outline-none w-full";

export default function Profile() {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    full_name: user?.full_name || user?.name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    age: user?.age || 20,
    gender: user?.gender || "Not Specified",
    target_weight: user?.target_weight || 70,
    daily_calorie_goal: user?.daily_calorie_goal || 2000,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-slate-400 text-xl mb-6">You need to be logged in to edit your profile.</p>
          <Link to="/" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-8 rounded-2xl transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await api.updateProfile(form.email, form);
      if (res.status === "Success") {
        login({ ...user, ...form });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.message || "Failed to save.");
      }
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <img
            src={user.picture || user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.full_name || "U")}&background=10b981&color=fff`}
            alt="avatar"
            className="w-16 h-16 rounded-full border-2 border-emerald-500"
          />
          <div>
            <h1 className="text-3xl font-black text-white">Edit Profile</h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-3xl border border-emerald-500/20 p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Full Name</label>
              <input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Email</label>
              <input className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl text-slate-500 outline-none w-full cursor-not-allowed" value={form.email} readOnly disabled />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Phone Number</label>
              <input className={inputCls} value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder="+1 234 567 8900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Age</label>
              <input type="number" className={inputCls} value={form.age} onChange={(e) => set("age", +e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Gender</label>
              <select className={selectCls} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option><option>Not Specified</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 text-sm font-bold">Target Weight (kg)</label>
              <input type="number" step="0.1" className={inputCls} value={form.target_weight} onChange={(e) => set("target_weight", +e.target.value)} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-slate-400 text-sm font-bold">Daily Calorie Goal</label>
              <input type="number" className={inputCls} value={form.daily_calorie_goal} onChange={(e) => set("daily_calorie_goal", +e.target.value)} />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black py-4 rounded-2xl text-lg transition-all"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {saved && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-400 text-center font-bold">
              Profile saved successfully!
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-center font-bold">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
