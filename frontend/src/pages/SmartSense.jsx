import { useSmartSense } from "../smartsense/hooks/useSmartSense";
import TopBar from "../smartsense/components/TopBar";
import SummaryBar from "../smartsense/components/SummaryBar";
import StatusPanel from "../smartsense/components/StatusPanel";
import DeviceControl from "../smartsense/components/DeviceControl";
import AnalyticsCharts from "../smartsense/components/AnalyticsCharts";
import EnergyWidget from "../smartsense/components/EnergyWidget";
import AlertsPanel from "../smartsense/components/AlertsPanel";
import InsightsPanel from "../smartsense/components/InsightsPanel";
import ClickSpark from "../smartsense/components/lib/ClickSpark";
import Galaxy from "../smartsense/components/lib/Galaxy";

export default function SmartSense() {
  const {
    status,
    devices,
    analytics,
    energy,
    alerts,
    insights,
    rooms,
    loading,
    lastRefresh,
    useMock,
    toggleDevice,
    dismissAlert,
    toggleRoomDevice,
    refresh,
  } = useSmartSense();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100" style={{ position: "relative" }}>
      {/* Galaxy star-field background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Galaxy
          transparent={true}
          density={0.8}
          hueShift={200}
          saturation={0.6}
          glowIntensity={0.5}
          twinkleIntensity={0.4}
          rotationSpeed={0.03}
          mouseRepulsion={false}
          mouseInteraction={false}
          speed={0.6}
        />
      </div>

      {/* ClickSpark wraps the entire interactive content */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <ClickSpark
          sparkColor="#38bdf8"
          sparkSize={12}
          sparkRadius={22}
          sparkCount={10}
          duration={500}
          extraScale={1.2}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Top bar */}
            <TopBar
              lastRefresh={lastRefresh}
              loading={loading}
              useMock={useMock}
              onRefresh={refresh}
            />

            {/* Summary stats row */}
            <SummaryBar status={status} energy={energy} alerts={alerts} />

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-1 space-y-5">
                <StatusPanel status={status} />
                <EnergyWidget energy={energy} />
              </div>

              {/* CENTER COLUMN */}
              <div className="lg:col-span-1 space-y-5">
                <AnalyticsCharts analytics={analytics} />
                <DeviceControl
                  devices={devices}
                  onToggle={toggleDevice}
                  rooms={rooms}
                  onToggleRoom={toggleRoomDevice}
                />
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-1 space-y-5">
                <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
                <InsightsPanel insights={insights} />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-700">
              SmartSense IoT Dashboard · Wi-Fi + PIR + mmWave + LDR sensing
            </div>
          </div>
        </ClickSpark>
      </div>
    </div>
  );
}
