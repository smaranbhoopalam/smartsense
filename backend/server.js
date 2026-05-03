// ─── SmartSense IoT Backend Server ───────────────────────────────────────────
// Express REST API + WebSocket real-time updates + Serial communication
//
// Data flow: ESP32 → Serial → Backend → WebSocket → Frontend
//                                    ↕ REST API ↕

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");

const { SerialReader } = require("./serialReader");
const { LedController } = require("./ledLogic");
const { IntrusionDetector } = require("./intrusionDetector");
const { TelegramNotifier } = require("./notifier");

// ─── Configuration ───────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT) || 3001;
const SERIAL_PORT = process.env.SERIAL_PORT || "";
const SERIAL_BAUD = parseInt(process.env.SERIAL_BAUD) || 115200;
const KNOWN_MACS = (process.env.KNOWN_MACS || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// ─── Initialize Modules ─────────────────────────────────────────────────────

const ledController = new LedController();
const intrusionDetector = new IntrusionDetector({
  knownMacs: KNOWN_MACS,
  rssiStddevThreshold: parseFloat(process.env.RSSI_STDDEV_THRESHOLD) || 5.0,
  windowSize: parseInt(process.env.RSSI_WINDOW_SIZE) || 20,
});
const notifier = new TelegramNotifier(
  process.env.TELEGRAM_BOT_TOKEN,
  process.env.TELEGRAM_CHAT_ID
);
const serialReader = new SerialReader({
  port: SERIAL_PORT,
  baudRate: SERIAL_BAUD,
});

// ─── Global State ────────────────────────────────────────────────────────────

const state = {
  mode: "ENERGY", // 'ENERGY' | 'SECURITY'
  securityMode: "DEVICE_FREE", // 'DEVICE_BASED' | 'DEVICE_FREE'

  // Latest sensor readings
  rssi: -60,
  ldr: 0,
  presence: false,

  // Energy mode
  ledLevel: 0,
  leds: [false, false, false, false],
  rssiSmooth: -60,
  ldrSmooth: 0,

  // Security mode
  intrusion: false,
  intrusionType: null,
  buzzer: false,
  currentStddev: 0,
  alertHistory: [],

  // Meta
  serialConnected: false,
  simulating: false,
  lastUpdate: Date.now(),
};

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

// GET /status — Full current state
app.get("/status", (req, res) => {
  res.json({
    ...state,
    uptime: process.uptime(),
  });
});

// POST /mode — Switch between ENERGY and SECURITY
app.post("/mode", (req, res) => {
  const { mode } = req.body;
  if (!["ENERGY", "SECURITY"].includes(mode)) {
    return res.status(400).json({ error: "Invalid mode. Use ENERGY or SECURITY." });
  }

  state.mode = mode;

  // Reset the inactive mode's state
  if (mode === "ENERGY") {
    intrusionDetector.reset();
    state.intrusion = false;
    state.intrusionType = null;
    state.buzzer = false;
    state.currentStddev = 0;
    console.log("[Mode] Switched to ENERGY — Security disabled");
  } else {
    ledController.reset();
    state.ledLevel = 0;
    state.leds = [false, false, false, false];
    console.log("[Mode] Switched to SECURITY — Energy disabled");
  }

  // Notify ESP32
  serialReader.write({ cmd: "mode", mode });

  broadcastState();
  res.json({ status: "ok", mode: state.mode });
});

// POST /security-mode — Switch security sub-mode
app.post("/security-mode", (req, res) => {
  const { securityMode } = req.body;
  if (!["DEVICE_BASED", "DEVICE_FREE"].includes(securityMode)) {
    return res
      .status(400)
      .json({ error: "Invalid security mode. Use DEVICE_BASED or DEVICE_FREE." });
  }

  state.securityMode = securityMode;
  intrusionDetector.reset();
  state.intrusion = false;
  state.intrusionType = null;
  state.buzzer = false;

  serialReader.write({ cmd: "securityMode", securityMode });

  console.log(`[Security] Sub-mode changed to ${securityMode}`);
  broadcastState();
  res.json({ status: "ok", securityMode: state.securityMode });
});

// ─── HTTP + WebSocket Server ─────────────────────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  // Send current state immediately
  ws.send(JSON.stringify({ type: "state", data: state }));

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});

function broadcastState() {
  const msg = JSON.stringify({ type: "state", data: state });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// ─── Serial Data Processing ─────────────────────────────────────────────────

serialReader.on("connected", (port) => {
  state.serialConnected = true;
  state.simulating = false;
  console.log(`[System] Serial connected on ${port}`);
});

serialReader.on("disconnected", () => {
  state.serialConnected = false;
  console.log("[System] Serial disconnected");
});

serialReader.on("simulating", () => {
  state.serialConnected = false;
  state.simulating = true;
  console.log("[System] Running in simulation mode");
});

serialReader.on("data", (data) => {
  // Update raw sensor readings
  state.rssi = data.rssi;
  state.ldr = data.ldr;
  state.presence = data.presence;
  state.lastUpdate = data.timestamp;

  if (state.mode === "ENERGY") {
    // ──── ENERGY MODE PROCESSING ────
    const result = ledController.update(data.rssi, data.ldr, data.presence);
    state.ledLevel = result.ledLevel;
    state.rssiSmooth = result.rssiSmooth;
    state.ldrSmooth = result.ldrSmooth;
    state.leds = [
      result.ledLevel >= 1,
      result.ledLevel >= 2,
      result.ledLevel >= 3,
      result.ledLevel >= 4,
    ];

    // Security is disabled in energy mode
    state.intrusion = false;
    state.buzzer = false;

    // Send LED level to ESP32
    serialReader.write({ cmd: "leds", level: result.ledLevel });
  } else {
    // ──── SECURITY MODE PROCESSING ────
    // LEDs are disabled in security mode
    state.ledLevel = 0;
    state.leds = [false, false, false, false];

    let result;
    if (state.securityMode === "DEVICE_BASED") {
      result = intrusionDetector.checkDeviceBased(data.macs || []);
    } else {
      result = intrusionDetector.checkDeviceFree(data.rssi);
      state.currentStddev = result.stddev;
    }

    state.intrusion = result.intrusion;
    const detState = intrusionDetector.getState();
    state.intrusionType = detState.intrusionType;
    state.alertHistory = detState.alertHistory;
    state.buzzer = result.intrusion;

    // Send buzzer command to ESP32
    serialReader.write({ cmd: "buzzer", on: result.intrusion });

    // Send Telegram notification on new intrusion
    if (result.intrusion) {
      notifier.sendAlert({
        type: detState.intrusionType,
        message: detState.alertHistory[0]?.message || "Intrusion detected",
        mode: state.securityMode,
      });
    }
  }

  broadcastState();
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════════`);
  console.log(`  SmartSense Backend`);
  console.log(`  REST API:    http://localhost:${PORT}`);
  console.log(`  WebSocket:   ws://localhost:${PORT}`);
  console.log(`══════════════════════════════════════════════\n`);

  // Start serial reader
  serialReader.start();
});
