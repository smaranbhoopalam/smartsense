export default function LedVisualizer({ ledLevel, leds }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Energy Mode
          </p>
          <h3 className="text-white font-bold text-lg">Smart LED Control</h3>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="text-xs text-slate-400">Level</span>
          <span className="text-sm font-black text-cyan-400">{ledLevel}/4</span>
        </div>
      </div>

      <div className="flex justify-between items-center max-w-sm mx-auto px-4">
        {[0, 1, 2, 3].map((index) => {
          const isOn = leds[index];
          return (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                    isOn ? "bg-yellow-400/60 scale-150" : "bg-transparent scale-100"
                  }`}
                />
                
                {/* Bulb */}
                <div
                  className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${
                    isOn
                      ? "bg-yellow-100 border-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.8)]"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >
                  <span className={`text-xl ${isOn ? "opacity-100" : "opacity-30 grayscale"}`}>
                    💡
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-bold transition-colors duration-300 ${
                  isOn ? "text-yellow-400" : "text-slate-600"
                }`}
              >
                LED {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
