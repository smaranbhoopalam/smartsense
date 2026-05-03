// ─── SmartSense LED Control Logic ────────────────────────────────────────────
// Threshold-based LED control with EMA smoothing and hysteresis.
//
// Rules:
//   1. Bright room (LDR < 800)  → 0 LEDs  (daylight, no artificial light needed)
//   2. No presence              → 0 LEDs  (nobody nearby)
//   3. Dark + present           → 1–4 LEDs based on RSSI proximity
//
// RSSI-to-LED mapping (dark + present):
//   > -25 dBm  → 4 LEDs  (very close)
//   > -30 dBm  → 3 LEDs
//   > -35 dBm  → 2 LEDs
//   > -40 dBm  → 1 LED
//   ≤ -40 dBm  → 0 LEDs  (too far)
//
// Smoothing: EMA with α = 0.2
// Hysteresis: LED level must be stable for 3 consecutive readings before change

const ALPHA = 0.2; // EMA smoothing factor
const LDR_BRIGHT_THRESHOLD = 800; // Below this = bright (daylight)
const HYSTERESIS_COUNT = 3; // Consecutive readings needed to change LED level

// RSSI thresholds for LED levels (from strongest to weakest)
const RSSI_THRESHOLDS = [
  { min: -25, leds: 4 }, // Very close
  { min: -30, leds: 3 }, // Close
  { min: -35, leds: 2 }, // Near
  { min: -40, leds: 1 }, // Far
];

class LedController {
  constructor() {
    this.rssiSmooth = -60;
    this.ldrSmooth = 0;
    this.currentLevel = 0;
    this.pendingLevel = 0;
    this.stableCount = 0;
  }

  /**
   * Apply EMA filter to a value.
   * @param {number} current - Current smoothed value
   * @param {number} raw - New raw reading
   * @returns {number} New smoothed value
   */
  ema(current, raw) {
    return ALPHA * raw + (1 - ALPHA) * current;
  }

  /**
   * Compute the desired LED level from smoothed sensor values.
   * @param {number} rssi - Smoothed RSSI value
   * @param {number} ldr - Smoothed LDR value
   * @param {boolean} presence - Whether someone is present
   * @returns {number} LED level (0–4)
   */
  computeRawLevel(rssi, ldr, presence) {
    // Rule 1: Bright room → all OFF
    if (ldr < LDR_BRIGHT_THRESHOLD) return 0;

    // Rule 2: No presence → all OFF
    if (!presence) return 0;

    // Rule 3: Dark + present → map RSSI to LED count
    for (const tier of RSSI_THRESHOLDS) {
      if (rssi > tier.min) return tier.leds;
    }

    return 0; // RSSI too weak
  }

  /**
   * Process new sensor readings and return the stable LED level.
   * @param {number} rssiRaw - Raw RSSI reading (negative dBm)
   * @param {number} ldrRaw - Raw LDR reading (0–4095)
   * @param {boolean} presence - Presence flag
   * @returns {{ ledLevel: number, rssiSmooth: number, ldrSmooth: number }}
   */
  update(rssiRaw, ldrRaw, presence) {
    // Apply EMA smoothing
    this.rssiSmooth = this.ema(this.rssiSmooth, rssiRaw);
    this.ldrSmooth = this.ema(this.ldrSmooth, ldrRaw);

    // Compute desired level
    const desired = this.computeRawLevel(this.rssiSmooth, this.ldrSmooth, presence);

    // Hysteresis: only change if desired level is stable for N consecutive readings
    if (desired !== this.currentLevel) {
      if (desired === this.pendingLevel) {
        this.stableCount++;
      } else {
        this.pendingLevel = desired;
        this.stableCount = 1;
      }

      if (this.stableCount >= HYSTERESIS_COUNT) {
        this.currentLevel = desired;
        this.stableCount = 0;
      }
    } else {
      // Reset pending if we're back to current level
      this.pendingLevel = this.currentLevel;
      this.stableCount = 0;
    }

    return {
      ledLevel: this.currentLevel,
      rssiSmooth: Math.round(this.rssiSmooth * 100) / 100,
      ldrSmooth: Math.round(this.ldrSmooth * 100) / 100,
    };
  }

  /** Reset all state */
  reset() {
    this.rssiSmooth = -60;
    this.ldrSmooth = 0;
    this.currentLevel = 0;
    this.pendingLevel = 0;
    this.stableCount = 0;
  }
}

module.exports = { LedController };
