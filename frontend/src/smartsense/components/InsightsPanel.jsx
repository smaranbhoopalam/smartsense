import BorderGlow from "./lib/BorderGlow";

const CATEGORY_STYLES = {
  energy: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", tag: "bg-yellow-500/20 text-yellow-400", label: "Energy" },
  security: { bg: "bg-red-500/10", border: "border-red-500/20", tag: "bg-red-500/20 text-red-400", label: "Security" },
  pattern: { bg: "bg-blue-500/10", border: "border-blue-500/20", tag: "bg-blue-500/20 text-blue-400", label: "Pattern" },
  positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", tag: "bg-emerald-500/20 text-emerald-400", label: "Positive" },
};

export default function InsightsPanel({ insights }) {
  return (
    <BorderGlow
      backgroundColor="#0d1117"
      borderRadius={16}
      glowColor="270 70 65"
      colors={["#c084fc", "#818cf8", "#38bdf8"]}
      glowIntensity={1.0}
      edgeSensitivity={28}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">AI-Generated</p>
            <h3 className="text-white font-bold text-lg">Weekly Insights</h3>
          </div>
          <span className="ml-auto text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2.5 py-1 rounded-full font-semibold">
            ✨ AI
          </span>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => {
            const style = CATEGORY_STYLES[insight.category] || CATEGORY_STYLES.pattern;
            return (
              <div
                key={insight.id}
                className={`rounded-xl border p-4 transition-all hover:scale-[1.01] duration-200 ${style.bg} ${style.border}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.tag}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-slate-600">{insight.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{insight.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.detail}</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">→ {insight.impact}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BorderGlow>
  );
}
