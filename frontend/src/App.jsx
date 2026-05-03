import { useSmartSenseWS } from "./hooks/useSmartSenseWS";
import TopBar from "./components/TopBar";
import SummaryBar from "./components/SummaryBar";
import ModeSelector from "./components/ModeSelector";
import SecuritySubModeSelector from "./components/SecuritySubModeSelector";
import LiveDataCards from "./components/LiveDataCards";
import LiveCharts from "./components/LiveCharts";
import LedVisualizer from "./components/LedVisualizer";
import SecurityPanel from "./components/SecurityPanel";
import EnergyWidget from "./components/EnergyWidget";

export default function App() {
  const {
    state,
    rssiHistory,
    ldrHistory,
    connected,
    useMock,
    setMode,
    setSecurityMode,
  } = useSmartSenseWS();

  const isEnergy = state.mode === "ENERGY";

  // Compute stats for SummaryBar
  const energyMock = {
    totalSaved: 11.5,
    costSaved: 2.87,
    co2Reduced: 5.2,
    efficiency: 73,
    weeklyTrend: "+12%",
  };

  const summaryStatus = {
    occupancy: state.presence ? "Occupied" : "Empty",
    confidence: isEnergy ? (state.presence ? 95 : 10) : 0, // Mock confidence
    deviceCount: state.serialConnected ? 1 : 0,
    wifiDevices: 1,
    bleDevices: 0,
  };

  // Mock alerts for SummaryBar count
  const mockAlerts = state.intrusion
    ? [{ id: 1, resolved: false }]
    : state.alertHistory.map((a) => ({ id: a.id, resolved: true }));

  return (
    <div className="min-h-screen text-slate-100 bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <TopBar
          lastRefresh={new Date(state.lastUpdate)}
          loading={!connected}
          useMock={useMock || state.simulating}
          onRefresh={() => {}} // No-op, WS handles refresh
        />

        <ModeSelector currentMode={state.mode} onModeChange={setMode} />

        <SummaryBar
          status={summaryStatus}
          energy={energyMock}
          alerts={mockAlerts}
        />

        {!isEnergy && (
          <SecuritySubModeSelector
            currentSubMode={state.securityMode}
            onSubModeChange={setSecurityMode}
          />
        )}

        <LiveDataCards
          rssi={state.rssi}
          ldr={state.ldr}
          presence={state.presence}
          rssiSmooth={state.rssiSmooth}
          ldrSmooth={state.ldrSmooth}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <LiveCharts rssiHistory={rssiHistory} ldrHistory={ldrHistory} />
          </div>

          <div className="lg:col-span-1">
            {isEnergy ? (
              <>
                <LedVisualizer ledLevel={state.ledLevel} leds={state.leds} />
                <EnergyWidget energy={energyMock} />
              </>
            ) : (
              <SecurityPanel state={state} />
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          SmartSense IoT Dashboard · Real-time WebSocket Data
        </div>
      </div>
    </div>
  );
}
