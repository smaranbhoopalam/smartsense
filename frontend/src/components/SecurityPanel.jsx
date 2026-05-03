import BorderGlow from "./lib/BorderGlow";

export default function SecurityPanel({ state }) {
  const { intrusion, intrusionType, buzzer, alertHistory, currentStddev, securityMode } = state;

  return (
    <BorderGlow
      backgroundColor="#0d1117"
      borderRadius={16}
      glowColor={intrusion ? "0 80 60" : "160 80 60"}
      colors={
        intrusion
          ? ["#ef4444", "#f97316", "#dc2626"]
          : ["#22c55e", "#06b6d4", "#10b981"]
      }
      glowIntensity={intrusion ? 1.5 : 0.8}
      edgeSensitivity={25}
      animated={intrusion}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
              Live Status
            </p>
            <h3 className="text-white font-bold text-lg">Intrusion Detection</h3>
          </div>
          {buzzer && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full animate-pulse">
              <span>🔊</span>
              <span className="text-xs font-bold">ALARM ACTIVE</span>
            </div>
          )}
        </div>

        {/* Main Status Display */}
        <div
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 mb-6 transition-all duration-500 ${
            intrusion
              ? "bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "bg-emerald-500/5 border-emerald-500/20"
          }`}
        >
          <span className={`text-6xl mb-4 ${intrusion ? "animate-bounce" : ""}`}>
            {intrusion ? "🚨" : "🛡️"}
          </span>
          <h2
            className={`text-2xl font-black mb-2 tracking-wide ${
              intrusion ? "text-red-500" : "text-emerald-400"
            }`}
          >
            {intrusion ? "INTRUSION DETECTED" : "SYSTEM SECURE"}
          </h2>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            {intrusion
              ? intrusionType === "UNKNOWN_DEVICE"
                ? "An unauthorized MAC address has been detected on the network."
                : `Abnormal RSSI fluctuation detected (σ = ${currentStddev}).`
              : securityMode === "DEVICE_BASED"
              ? "Scanning for unauthorized MAC addresses."
              : `Monitoring RSSI stability (current σ = ${currentStddev}).`}
          </p>
        </div>

        {/* Alert History */}
        {alertHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-3">Recent Events</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {alertHistory.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-start gap-3"
                >
                  <span className="mt-0.5">{alert.type === "UNKNOWN_DEVICE" ? "📱" : "📡"}</span>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BorderGlow>
  );
}
