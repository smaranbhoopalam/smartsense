// ─── SmartSense Mock Data ────────────────────────────────────────────────────

export const mockStatus = {
  occupancy: "Occupied",
  confidence: 87,
  deviceCount: 4,
  wifiDevices: 3,
  bleDevices: 1,
  lastUpdated: new Date().toISOString(),
  pirActive: true,
  mmwaveActive: true,
  ldrValue: 342,
  lightLevel: "Dim",
};

export const mockDevices = {
  lights: true,
  fans: false,
  ac: true,
  tv: false,
};

export const mockAnalytics = {
  occupancyHourly: [
    { time: "00:00", value: 0 },
    { time: "02:00", value: 0 },
    { time: "04:00", value: 0 },
    { time: "06:00", value: 20 },
    { time: "08:00", value: 85 },
    { time: "10:00", value: 92 },
    { time: "12:00", value: 78 },
    { time: "14:00", value: 45 },
    { time: "16:00", value: 88 },
    { time: "18:00", value: 95 },
    { time: "20:00", value: 90 },
    { time: "22:00", value: 60 },
  ],
  energyDaily: [
    { day: "Mon", saved: 1.2, used: 3.8 },
    { day: "Tue", saved: 1.8, used: 3.2 },
    { day: "Wed", saved: 2.1, used: 2.9 },
    { day: "Thu", saved: 1.5, used: 3.5 },
    { day: "Fri", saved: 2.4, used: 2.6 },
    { day: "Sat", saved: 0.9, used: 4.1 },
    { day: "Sun", saved: 1.6, used: 3.4 },
  ],
  deviceActivity: [
    { time: "06:00", lights: 1, fans: 0, ac: 0 },
    { time: "08:00", lights: 1, fans: 1, ac: 0 },
    { time: "10:00", lights: 1, fans: 1, ac: 1 },
    { time: "12:00", lights: 0, fans: 1, ac: 1 },
    { time: "14:00", lights: 0, fans: 0, ac: 1 },
    { time: "16:00", lights: 1, fans: 0, ac: 1 },
    { time: "18:00", lights: 1, fans: 1, ac: 1 },
    { time: "20:00", lights: 1, fans: 1, ac: 0 },
    { time: "22:00", lights: 1, fans: 0, ac: 0 },
  ],
};

export const mockEnergy = {
  totalSaved: 11.5,
  costSaved: 2.87,
  co2Reduced: 5.2,
  efficiency: 73,
  weeklyTrend: "+12%",
};

export const mockAlerts = [
  {
    id: 1,
    type: "Physical Intrusion",
    message: "Motion detected in Room 2 — no authorized device found",
    severity: "critical",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    room: "Room 2",
    resolved: false,
  },
  {
    id: 2,
    type: "Unknown Device",
    message: "Unrecognized Wi-Fi device detected: MAC 3A:F2:...",
    severity: "level2",
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    room: "Living Room",
    resolved: false,
  },
  {
    id: 3,
    type: "Device Proximity",
    message: "New BLE device in proximity — not in whitelist",
    severity: "level1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    room: "Entrance",
    resolved: true,
  },
  {
    id: 4,
    type: "Unknown Device",
    message: "Unrecognized device joined network briefly",
    severity: "level1",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    room: "Bedroom",
    resolved: true,
  },
];

export const mockInsights = [
  {
    id: 1,
    icon: "💡",
    title: "Lights left ON while unoccupied",
    detail: "Room was unoccupied but lights remained ON between 2:00 PM – 4:00 PM today.",
    impact: "~0.4 kWh wasted",
    category: "energy",
    time: "Today",
  },
  {
    id: 2,
    icon: "❄️",
    title: "AC running in empty room",
    detail: "AC was active for 45 minutes with no occupancy detected on Wednesday.",
    impact: "~0.9 kWh wasted",
    category: "energy",
    time: "Wed",
  },
  {
    id: 3,
    icon: "📈",
    title: "Peak occupancy: 6–9 PM",
    detail: "Highest room usage consistently occurs between 6 PM and 9 PM on weekdays.",
    impact: "Optimize scheduling",
    category: "pattern",
    time: "Weekly",
  },
  {
    id: 4,
    icon: "🔒",
    title: "2 intrusion attempts this week",
    detail: "Two unrecognized devices were detected near the entrance on Tuesday and Thursday.",
    impact: "Security review recommended",
    category: "security",
    time: "This week",
  },
  {
    id: 5,
    icon: "⚡",
    title: "Energy efficiency improved",
    detail: "Smart automation saved 12% more energy compared to last week.",
    impact: "+12% efficiency",
    category: "positive",
    time: "Weekly",
  },
];

export const mockRooms = [
  { id: 1, name: "Living Room", occupied: true, confidence: 87, devices: 3, lights: true, fans: false, ac: true },
  { id: 2, name: "Bedroom", occupied: false, confidence: 12, devices: 0, lights: false, fans: false, ac: false },
  { id: 3, name: "Kitchen", occupied: true, confidence: 64, devices: 1, lights: true, fans: true, ac: false },
  { id: 4, name: "Entrance", occupied: false, confidence: 31, devices: 1, lights: false, fans: false, ac: false },
];
