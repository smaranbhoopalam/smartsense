// ─── Live Sensor Data Cards ──────────────────────────────────────────────────

function SignalBars({ rssi }) {
  // Map RSSI to 0-4 bars
  const strength =
    rssi > -25 ? 4 : rssi > -35 ? 3 : rssi > -45 ? 2 : rssi > -55 ? 1 : 0;

  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[4px] rounded-sm transition-all duration-500 ${
            i <= strength ? "bg-cyan-400" : "bg-slate-700"
          }`}
          style={{ height: `${i * 5}px` }}
        />
      ))}
    </div>
  );
}

function BrightnessIcon({ ldr }) {
  // Higher LDR = darker. < 800 = bright, > 2500 = very dark
  const level = ldr < 800 ? "☀️" : ldr < 1500 ? "🌤️" : ldr < 2500 ? "🌙" : "🌑";
  return <span className="text-xl">{level}</span>;
}

export default function LiveDataCards({ rssi, ldr, presence, rssiSmooth, ldrSmooth }) {
  const cards = [
    {
      id: "rssi",
      label: "WiFi Signal (RSSI)",
      value: `${Math.round(rssiSmooth ?? rssi)} dBm`,
      sub: `Raw: ${Math.round(rssi)} dBm`,
      icon: <SignalBars rssi={rssiSmooth ?? rssi} />,
      color:
        (rssiSmooth ?? rssi) > -30
          ? "text-emerald-400"
          : (rssiSmooth ?? rssi) > -45
          ? "text-cyan-400"
          : "text-yellow-400",
      border:
        (rssiSmooth ?? rssi) > -30
          ? "border-emerald-500/20"
          : (rssiSmooth ?? rssi) > -45
          ? "border-cyan-500/20"
          : "border-yellow-500/20",
    },
    {
      id: "ldr",
      label: "Light Level (LDR)",
      value: Math.round(ldrSmooth ?? ldr),
      sub: ldr < 800 ? "Bright (daylight)" : ldr < 2000 ? "Moderate" : "Dark",
      icon: <BrightnessIcon ldr={ldrSmooth ?? ldr} />,
      color:
        ldr < 800
          ? "text-yellow-400"
          : ldr < 2000
          ? "text-orange-400"
          : "text-violet-400",
      border:
        ldr < 800
          ? "border-yellow-500/20"
          : ldr < 2000
          ? "border-orange-500/20"
          : "border-violet-500/20",
    },
    {
      id: "presence",
      label: "Presence",
      value: presence ? "Detected" : "No presence",
      sub: presence ? "Someone is nearby" : "Area is clear",
      icon: (
        <div className="relative">
          <span className="text-xl">{presence ? "👤" : "👻"}</span>
          {presence && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          )}
        </div>
      ),
      color: presence ? "text-emerald-400" : "text-slate-500",
      border: presence ? "border-emerald-500/20" : "border-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-slate-900/80 backdrop-blur-sm border ${card.border} rounded-2xl px-5 py-4 transition-all duration-500 hover:border-slate-600`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {card.label}
            </p>
            {card.icon}
          </div>
          <p className={`text-2xl font-black ${card.color} transition-colors duration-500`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
