export default function SummaryBar({ status, energy, alerts }) {
  const activeAlerts = alerts.filter((a) => !a.resolved).length;

  const stats = [
    {
      label: "Occupancy",
      value: status.occupancy,
      sub: `${Math.round(status.confidence)}% confidence`,
      icon: "👤",
      color: status.occupancy === "Occupied" ? "text-emerald-400" : "text-yellow-400",
    },
    {
      label: "Devices Online",
      value: status.deviceCount,
      sub: `${status.wifiDevices} Wi-Fi · ${status.bleDevices} BLE`,
      icon: "📶",
      color: "text-cyan-400",
    },
    {
      label: "Energy Saved",
      value: `${energy.totalSaved} kWh`,
      sub: `$${energy.costSaved} saved this week`,
      icon: "⚡",
      color: "text-emerald-400",
    },
    {
      label: "Active Alerts",
      value: activeAlerts,
      sub: activeAlerts > 0 ? "Requires attention" : "All clear",
      icon: "🚨",
      color: activeAlerts > 0 ? "text-red-400" : "text-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-slate-700 transition-colors"
        >
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-600">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
