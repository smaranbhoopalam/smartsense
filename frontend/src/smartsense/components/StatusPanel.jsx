import { useState, useEffect } from "react";
import BorderGlow from "./lib/BorderGlow";

function ConfidenceRing({ value }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }}
        />
      </svg>
      <span className="text-xl font-black text-white z-10">{Math.round(value)}%</span>
    </div>
  );
}

export default function StatusPanel({ status }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(t);
  }, [status.lastUpdated]);

  const isOccupied = status.occupancy === "Occupied";
  const isIntrusion = status.confidence < 30 && status.deviceCount > 0;

  const statusConfig = isIntrusion
    ? { dot: "bg-red-500", text: "text-red-400", label: "INTRUSION", glowColor: "0 80 60", colors: ["#ef4444", "#f97316", "#dc2626"] }
    : isOccupied
    ? { dot: "bg-emerald-500", text: "text-emerald-400", label: "OCCUPIED", glowColor: "160 80 60", colors: ["#22c55e", "#06b6d4", "#10b981"] }
    : { dot: "bg-yellow-400", text: "text-yellow-400", label: "EMPTY", glowColor: "50 80 60", colors: ["#eab308", "#f59e0b", "#84cc16"] };

  return (
    <BorderGlow
      backgroundColor="#0d1117"
      borderRadius={16}
      glowColor={statusConfig.glowColor}
      colors={statusConfig.colors}
      glowIntensity={1.2}
      edgeSensitivity={25}
      animated={true}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Live Room Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} ${pulse ? "animate-ping" : ""}`} />
              <span className={`text-lg font-black ${statusConfig.text}`}>{statusConfig.label}</span>
            </div>
          </div>
          <ConfidenceRing value={status.confidence} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBadge label="Wi-Fi Devices" value={status.wifiDevices} icon="📶" />
          <StatBadge label="PIR Sensor" value={status.pirActive ? "Active" : "Idle"} icon="👁️" active={status.pirActive} />
          <StatBadge label="Light Level" value={status.lightLevel} icon="☀️" />
          <StatBadge label="LDR Value" value={status.ldrValue} icon="🔆" />
        </div>

        <p className="text-xs text-slate-600 mt-4 text-right">
          Updated {new Date(status.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </BorderGlow>
  );
}

function StatBadge({ label, value, icon, active }) {
  return (
    <div className="bg-slate-800/60 rounded-xl px-3 py-2.5 flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-bold ${active === true ? "text-emerald-400" : active === false ? "text-slate-500" : "text-white"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
