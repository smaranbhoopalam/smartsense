import { useState } from "react";
import BorderGlow from "./lib/BorderGlow";

const SEVERITY_CONFIG = {
  critical: {
    label: "CRITICAL",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
    icon: "🚨",
  },
  level2: {
    label: "LEVEL 2",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-400",
    icon: "⚠️",
  },
  level1: {
    label: "LEVEL 1",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-400",
    icon: "📡",
  },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsPanel({ alerts, onDismiss }) {
  const [showResolved, setShowResolved] = useState(false);

  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);
  const displayed = showResolved ? alerts : active;

  return (
    <BorderGlow
      backgroundColor="#0d1117"
      borderRadius={16}
      glowColor="0 80 60"
      colors={["#ef4444", "#f97316", "#ec4899"]}
      glowIntensity={active.length > 0 ? 1.3 : 0.7}
      edgeSensitivity={25}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Security</p>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-lg">Intrusion Alerts</h3>
              {active.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {active.length}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowResolved((v) => !v)}
            className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-all"
          >
            {showResolved ? "Active only" : `+${resolved.length} resolved`}
          </button>
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl">🛡️</span>
            <p className="text-slate-500 mt-3 text-sm">No active alerts. System secure.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {displayed.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.level1;
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 transition-all duration-300 ${
                    alert.resolved
                      ? "opacity-50 bg-slate-800/30 border-slate-800"
                      : `${cfg.bg} ${cfg.border}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-slate-500">{alert.room}</span>
                          {alert.resolved && (
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Resolved</span>
                          )}
                        </div>
                        <p className={`text-sm font-semibold ${alert.resolved ? "text-slate-400" : cfg.text}`}>
                          {alert.type}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{timeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none"
                        aria-label="Dismiss alert"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BorderGlow>
  );
}
