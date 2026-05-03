// ─── SmartSense Serial Reader ────────────────────────────────────────────────
// Reads JSON data from ESP32 over USB serial.
// Falls back to simulated data if no serial port is available.

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("serialport");
const EventEmitter = require("events");

class SerialReader extends EventEmitter {
  /**
   * @param {Object} config
   * @param {string} config.port - COM port (e.g., 'COM3'). Empty = auto-detect.
   * @param {number} config.baudRate - Baud rate (default: 115200)
   */
  constructor(config = {}) {
    super();
    this.portPath = config.port || "";
    this.baudRate = config.baudRate || 115200;
    this.serial = null;
    this.parser = null;
    this.connected = false;
    this.simulating = false;
    this.simulationInterval = null;
  }

  /** Start the serial reader. Attempts connection, falls back to simulation. */
  async start() {
    if (this.portPath) {
      return this._connect(this.portPath);
    }

    // Auto-detect ESP32
    try {
      const ports = await SerialPort.list();
      console.log("[Serial] Available ports:", ports.map((p) => p.path).join(", ") || "none");

      // Look for common ESP32 USB-serial chips
      const esp = ports.find(
        (p) =>
          p.manufacturer?.toLowerCase().includes("silicon") || // CP2102
          p.manufacturer?.toLowerCase().includes("wch") || // CH340
          p.vendorId === "10C4" || // Silicon Labs
          p.vendorId === "1A86" // QinHeng (CH340)
      );

      if (esp) {
        console.log(`[Serial] Auto-detected ESP32 on ${esp.path}`);
        return this._connect(esp.path);
      }
    } catch (err) {
      console.log("[Serial] Port enumeration failed:", err.message);
    }

    console.log("[Serial] No ESP32 found — starting simulation mode");
    this._startSimulation();
  }

  /** Connect to a specific serial port */
  _connect(portPath) {
    try {
      this.serial = new SerialPort({
        path: portPath,
        baudRate: this.baudRate,
      });

      this.parser = this.serial.pipe(new ReadlineParser({ delimiter: "\n" }));

      this.serial.on("open", () => {
        console.log(`[Serial] Connected to ${portPath} @ ${this.baudRate}`);
        this.connected = true;
        this.emit("connected", portPath);
      });

      this.parser.on("data", (line) => {
        this._processLine(line.trim());
      });

      this.serial.on("error", (err) => {
        console.error("[Serial] Error:", err.message);
        this.connected = false;
        this.emit("disconnected");
        // Fall back to simulation
        setTimeout(() => {
          if (!this.connected) {
            console.log("[Serial] Falling back to simulation");
            this._startSimulation();
          }
        }, 3000);
      });

      this.serial.on("close", () => {
        console.log("[Serial] Port closed");
        this.connected = false;
        this.emit("disconnected");
      });
    } catch (err) {
      console.error("[Serial] Connection failed:", err.message);
      console.log("[Serial] Starting simulation mode");
      this._startSimulation();
    }
  }

  /** Process a single line from serial */
  _processLine(line) {
    // Try JSON parse first
    try {
      const data = JSON.parse(line);
      if (data.rssi !== undefined && data.ldr !== undefined) {
        this.emit("data", {
          rssi: Number(data.rssi),
          ldr: Number(data.ldr),
          presence: Boolean(data.presence),
          ledLevel: data.ledLevel !== undefined ? Number(data.ledLevel) : undefined,
          intrusion: Boolean(data.intrusion),
          macs: data.macs || [],
          timestamp: Date.now(),
        });
        return;
      }
    } catch {
      // Not JSON — try CSV format (backward compat with working code)
    }

    // CSV fallback: time,rssi,ldr,leds,intrusion
    const parts = line.split(",");
    if (parts.length >= 5) {
      this.emit("data", {
        rssi: parseFloat(parts[1]),
        ldr: parseFloat(parts[2]),
        presence: parseFloat(parts[1]) > -40, // RSSI-based presence proxy
        ledLevel: parseInt(parts[3]),
        intrusion: parts[4].trim() === "1" || parts[4].trim() === "true",
        macs: [],
        timestamp: Date.now(),
      });
    }
  }

  /** Write data to serial (send commands to ESP32) */
  write(data) {
    if (this.serial && this.connected) {
      const json = typeof data === "string" ? data : JSON.stringify(data);
      this.serial.write(json + "\n");
    }
  }

  /** Start simulation mode with realistic fake data */
  _startSimulation() {
    if (this.simulating) return;
    this.simulating = true;
    this.emit("simulating");

    let rssi = -35;
    let ldr = 2500;
    let t = 0;

    this.simulationInterval = setInterval(() => {
      t++;

      // Simulate smooth RSSI wandering between -20 and -55
      rssi += (Math.random() - 0.48) * 2;
      rssi = Math.max(-55, Math.min(-15, rssi));

      // Simulate LDR with slow drift
      ldr += (Math.random() - 0.5) * 100;
      ldr = Math.max(100, Math.min(3800, ldr));

      // Presence changes occasionally
      const presence = rssi > -40;

      this.emit("data", {
        rssi: Math.round(rssi * 100) / 100,
        ldr: Math.round(ldr),
        presence,
        ledLevel: undefined, // Let backend compute
        intrusion: false,
        macs: [],
        timestamp: Date.now(),
      });
    }, 500);
  }

  /** Stop the reader */
  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.serial) {
      this.serial.close();
      this.serial = null;
    }
    this.connected = false;
    this.simulating = false;
  }
}

module.exports = { SerialReader };
