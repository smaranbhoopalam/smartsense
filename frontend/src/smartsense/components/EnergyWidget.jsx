import { useEffect, useRef, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import BorderGlow from "./lib/BorderGlow";

function AnimatedCounter({ target, decimals = 1, duration = 1500 }) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, decimals, duration]);

  return <span>{value.toFixed(decimals)}</span>;
}

export default function EnergyWidget({ energy }) {
  const radialData = [{ name: "Efficiency", value: energy.efficiency, fill: "#22c55e" }];

  return (
    <BorderGlow
      backgroundColor="#0d1117"
      borderRadius={16}
      glowColor="160 70 55"
      colors={["#22c55e", "#06b6d4", "#10b981"]}
      glowIntensity={1.0}
      edgeSensitivity={28}
    >
      <div className="p-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Energy Savings</p>
        <h3 className="text-white font-bold text-lg mb-5">This Week</h3>

        <div className="flex items-center gap-6 mb-6">
          {/* Radial gauge */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="65%" outerRadius="100%"
                startAngle={90} endAngle={-270}
                data={radialData}
                barSize={10}
              >
                <RadialBar background={{ fill: "#1e293b" }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-emerald-400">{energy.efficiency}%</span>
              <span className="text-xs text-slate-500">efficient</span>
            </div>
          </div>

          {/* Main stats */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Total Saved</p>
              <p className="text-3xl font-black text-white">
                <AnimatedCounter target={energy.totalSaved} decimals={1} />
                <span className="text-lg text-slate-400 ml-1">kWh</span>
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Cost Saved</p>
              <p className="text-2xl font-black text-emerald-400">
                $<AnimatedCounter target={energy.costSaved} decimals={2} />
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">CO₂ Reduced</p>
            <p className="text-lg font-black text-cyan-400">{energy.co2Reduced} <span className="text-sm font-normal text-slate-400">kg</span></p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Weekly Trend</p>
            <p className="text-lg font-black text-emerald-400">{energy.weeklyTrend}</p>
          </div>
        </div>
      </div>
    </BorderGlow>
  );
}
