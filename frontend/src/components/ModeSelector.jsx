import { useState } from "react";

const modes = [
  {
    key: "ENERGY",
    label: "Energy",
    icon: "⚡",
    desc: "Smart LED optimization",
    color: "cyan",
  },
  {
    key: "SECURITY",
    label: "Security",
    icon: "🔐",
    desc: "Intrusion detection",
    color: "red",
  },
];

export default function ModeSelector({ currentMode, onModeChange }) {
  const [switching, setSwitching] = useState(false);

  const handleSwitch = async (mode) => {
    if (mode === currentMode || switching) return;
    setSwitching(true);
    await onModeChange(mode);
    setTimeout(() => setSwitching(false), 300);
  };

  const isEnergy = currentMode === "ENERGY";

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            System Mode
          </p>
          <h3 className="text-white font-bold text-lg">
            {isEnergy ? "⚡ Energy Optimization" : "🔐 Security Active"}
          </h3>
        </div>

        {/* Status indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isEnergy
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isEnergy ? "bg-cyan-400" : "bg-red-400"
            } animate-pulse`}
          />
          {currentMode}
        </div>
      </div>

      {/* Mode toggle pills */}
      <div className="flex gap-3">
        {modes.map((m) => {
          const isActive = m.key === currentMode;
          const activeStyles =
            m.key === "ENERGY"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/20"
              : "bg-gradient-to-r from-red-600 to-orange-600 border-red-500/50 text-white shadow-lg shadow-red-500/20";

          return (
            <button
              key={m.key}
              onClick={() => handleSwitch(m.key)}
              disabled={switching}
              className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? activeStyles
                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
              } ${switching ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
            >
              <span className="text-2xl">{m.icon}</span>
              <div className="text-left">
                <p className={`font-bold text-sm ${isActive ? "text-white" : ""}`}>
                  {m.label}
                </p>
                <p
                  className={`text-xs ${
                    isActive ? "text-white/70" : "text-slate-600"
                  }`}
                >
                  {m.desc}
                </p>
              </div>
              {isActive && (
                <span className="ml-auto text-lg">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
