import { useState } from "react";

const DEVICE_CONFIG = [
  { key: "lights", label: "Lights", icon: "💡", onColor: "bg-yellow-400", offColor: "bg-slate-700" },
  { key: "fans", label: "Fan", icon: "🌀", onColor: "bg-cyan-400", offColor: "bg-slate-700" },
  { key: "ac", label: "AC", icon: "❄️", onColor: "bg-blue-400", offColor: "bg-slate-700" },
  { key: "tv", label: "TV", icon: "📺", onColor: "bg-purple-400", offColor: "bg-slate-700" },
];

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        on ? "bg-emerald-500 focus:ring-emerald-500" : "bg-slate-600 focus:ring-slate-500"
      } disabled:opacity-50`}
      aria-label={on ? "Turn off" : "Turn on"}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          on ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function DeviceControl({ devices, onToggle, rooms, onToggleRoom }) {
  const [activeTab, setActiveTab] = useState("global");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Device Control</p>
          <h3 className="text-white font-bold text-lg">Smart Devices</h3>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "global" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "rooms" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            By Room
          </button>
        </div>
      </div>

      {activeTab === "global" ? (
        <div className="grid grid-cols-2 gap-3">
          {DEVICE_CONFIG.map(({ key, label, icon, onColor }) => (
            <DeviceCard
              key={key}
              label={label}
              icon={icon}
              on={devices[key]}
              onColor={onColor}
              onToggle={() => onToggle(key)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <RoomRow key={room.id} room={room} onToggle={(dk) => onToggleRoom(room.id, dk)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceCard({ label, icon, on, onColor, onToggle }) {
  return (
    <div
      className={`rounded-xl p-4 border transition-all duration-300 cursor-pointer select-none ${
        on
          ? "bg-slate-800 border-slate-600"
          : "bg-slate-800/40 border-slate-800"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <Toggle on={on} onChange={onToggle} />
      </div>
      <p className="text-white font-semibold text-sm">{label}</p>
      <p className={`text-xs font-medium mt-0.5 ${on ? "text-emerald-400" : "text-slate-600"}`}>
        {on ? "ON" : "OFF"}
      </p>
    </div>
  );
}

function RoomRow({ room, onToggle }) {
  const occupied = room.occupied;
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${occupied ? "bg-emerald-500" : "bg-slate-600"}`} />
          <span className="text-white font-semibold text-sm">{room.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          occupied ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"
        }`}>
          {occupied ? "Occupied" : "Empty"}
        </span>
      </div>
      <div className="flex gap-4">
        {[
          { key: "lights", icon: "💡", label: "Light" },
          { key: "fans", icon: "🌀", label: "Fan" },
          { key: "ac", icon: "❄️", label: "AC" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              room[key]
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-700/50 text-slate-500 border border-slate-700"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
