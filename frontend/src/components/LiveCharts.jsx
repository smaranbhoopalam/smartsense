import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit || ""}
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, icon, data, dataKey, name, unit, color, gradientId, domain }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-white font-bold text-sm">{title}</h3>
        {data.length > 0 && (
          <span className="ml-auto text-xs text-slate-600">{data.length} pts</span>
        )}
      </div>
      <div className="h-44">
        {data.length < 2 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm">
            Waiting for data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={domain || ["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={dataKey} name={name} unit={unit} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} activeDot={{ r: 4, fill: color }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function LiveCharts({ rssiHistory, ldrHistory }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <ChartCard title="RSSI Signal Strength" icon="📡" data={rssiHistory} dataKey="value" name="RSSI" unit=" dBm" color="#06b6d4" gradientId="rssiGrad" domain={[-70, 0]} />
      <ChartCard title="Light Level (LDR)" icon="🔆" data={ldrHistory} dataKey="value" name="LDR" unit="" color="#a78bfa" gradientId="ldrGrad" domain={[0, 4095]} />
    </div>
  );
}
