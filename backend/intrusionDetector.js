// ─── SmartSense Intrusion Detection ──────────────────────────────────────────
//
// Two sub-modes:
//   A) DEVICE_BASED  — MAC address filtering against a known whitelist
//   B) DEVICE_FREE   — RSSI variance analysis (rolling standard deviation)

class IntrusionDetector {
  /**
   * @param {Object} config
   * @param {string[]} config.knownMacs - List of trusted MAC addresses (uppercase)
   * @param {number} config.rssiStddevThreshold - Stddev threshold for device-free mode
   * @param {number} config.windowSize - Rolling window size for RSSI samples
   */
  constructor(config = {}) {
    this.knownMacs = (config.knownMacs || []).map((m) => m.toUpperCase().trim());
    this.rssiStddevThreshold = config.rssiStddevThreshold || 5.0;
    this.windowSize = config.windowSize || 20;

    // Rolling RSSI window for device-free mode
    this.rssiWindow = [];

    // State
    this.intrusion = false;
    this.intrusionType = null; // 'UNKNOWN_DEVICE' | 'RSSI_ANOMALY' | null
    this.lastUnknownMac = null;
    this.currentStddev = 0;

    // Alert history (last 50)
    this.alertHistory = [];
  }

  // ──────────── DEVICE-BASED DETECTION ────────────

  /**
   * Check a list of detected MAC addresses against the known whitelist.
   * @param {string[]} detectedMacs - Array of detected MAC addresses
   * @returns {{ intrusion: boolean, unknownMacs: string[] }}
   */
  checkDeviceBased(detectedMacs) {
    const unknown = detectedMacs
      .map((m) => m.toUpperCase().trim())
      .filter((m) => !this.knownMacs.includes(m));

    if (unknown.length > 0) {
      this.intrusion = true;
      this.intrusionType = "UNKNOWN_DEVICE";
      this.lastUnknownMac = unknown[0];
      this._addAlert({
        type: "UNKNOWN_DEVICE",
        message: `Unknown device detected: ${unknown[0]}`,
        macs: unknown,
      });
    } else {
      this.intrusion = false;
      this.intrusionType = null;
      this.lastUnknownMac = null;
    }

    return { intrusion: this.intrusion, unknownMacs: unknown };
  }

  // ──────────── DEVICE-FREE DETECTION ────────────

  /**
   * Add an RSSI sample and check for anomalous fluctuation.
   * @param {number} rssi - Current RSSI reading
   * @returns {{ intrusion: boolean, stddev: number }}
   */
  checkDeviceFree(rssi) {
    // Add to rolling window
    this.rssiWindow.push(rssi);
    if (this.rssiWindow.length > this.windowSize) {
      this.rssiWindow.shift();
    }

    // Need at least 5 samples for meaningful statistics
    if (this.rssiWindow.length < 5) {
      this.intrusion = false;
      this.intrusionType = null;
      this.currentStddev = 0;
      return { intrusion: false, stddev: 0 };
    }

    // Calculate standard deviation
    const mean = this.rssiWindow.reduce((a, b) => a + b, 0) / this.rssiWindow.length;
    const variance =
      this.rssiWindow.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      this.rssiWindow.length;
    const stddev = Math.sqrt(variance);

    this.currentStddev = Math.round(stddev * 100) / 100;

    if (stddev > this.rssiStddevThreshold) {
      this.intrusion = true;
      this.intrusionType = "RSSI_ANOMALY";
      this._addAlert({
        type: "RSSI_ANOMALY",
        message: `RSSI fluctuation detected (σ=${this.currentStddev})`,
        stddev: this.currentStddev,
      });
    } else {
      this.intrusion = false;
      this.intrusionType = null;
    }

    return { intrusion: this.intrusion, stddev: this.currentStddev };
  }

  // ──────────── HELPERS ────────────

  _addAlert(data) {
    const alert = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > 50) {
      this.alertHistory.pop();
    }
  }

  /** Get current detection state */
  getState() {
    return {
      intrusion: this.intrusion,
      intrusionType: this.intrusionType,
      lastUnknownMac: this.lastUnknownMac,
      currentStddev: this.currentStddev,
      alertHistory: this.alertHistory.slice(0, 10),
    };
  }

  /** Reset all state */
  reset() {
    this.rssiWindow = [];
    this.intrusion = false;
    this.intrusionType = null;
    this.lastUnknownMac = null;
    this.currentStddev = 0;
  }
}

module.exports = { IntrusionDetector };
