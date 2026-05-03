const subModes = [
  {
    key: "DEVICE_BASED",
    label: "Device-Based",
    icon: "📱",
    desc: "MAC address filtering — detects unknown devices on the network",
    detail: "Compares connected devices against a trusted whitelist",
  },
  {
    key: "DEVICE_FREE",
    label: "Device-Free",
    icon: "📡",
    desc: "RSSI variance analysis — detects physical intrusion via signal fluctuation",
    detail: "Monitors WiFi signal stability using statistical analysis",
  },
];

export default function SecuritySubModeSelector({ currentSubMode, onSubModeChange }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-red-500/20 rounded-2xl p-5 mb-5">
      <p className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-3">
        🔒 Security Detection Method
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subModes.map((m) => {
          const isActive = m.key === currentSubMode;

          return (
            <button
              key={m.key}
              onClick={() => onSubModeChange(m.key)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "bg-red-500/10 border-red-500/40 ring-1 ring-red-500/20"
                  : "bg-slate-800/40 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{m.icon}</span>
                <span
                  className={`font-bold text-sm ${
                    isActive ? "text-red-400" : "text-slate-300"
                  }`}
                >
                  {m.label}
                </span>
                {isActive && (
                  <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className={`text-xs leading-relaxed ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                {m.desc}
              </p>
              <p className={`text-xs mt-1 ${isActive ? "text-red-400/60" : "text-slate-600"}`}>
                → {m.detail}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
