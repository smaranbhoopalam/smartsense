export default function TopBar({ lastRefresh, loading, useMock, onRefresh }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">
            🏠
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">SmartSense</h1>
            <p className="text-xs text-slate-500">IoT Energy & Security Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {useMock && (
          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-full font-medium">
            📡 Demo Mode
          </span>
        )}
        <span className="text-xs text-slate-600 hidden sm:block">
          Last sync: {lastRefresh.toLocaleTimeString()}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          aria-label="Refresh data"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
