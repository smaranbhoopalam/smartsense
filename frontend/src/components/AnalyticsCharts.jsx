import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.unit || ""}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsCharts({ analytics }) {
  const [activeChart, setActiveChart] = useState("occupancy");

  const tabs = [
    { key: "occupancy", label: "Occupancy" },
    { key: "energy", label: "Energy" },
    { key: "activity", label: "Device Activity" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Analytics</p>
          <h3 className="text-white font-bold text-lg">System Insights</h3>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveChart(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChart === t.key ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
        {activeChart === "occupancy" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.occupancyHourly} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Occupancy"
                unit="%"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#occGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "energy" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.energyDaily} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Bar dataKey="saved" name="Saved" unit=" kWh" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="used" name="Used" unit=" kWh" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "activity" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.deviceActivity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Line type="stepAfter" dataKey="lights" name="Lights" stroke="#eab308" strokeWidth={2} dot={false} />
              <Line type="stepAfter" dataKey="fans" name="Fan" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="stepAfter" dataKey="ac" name="AC" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
