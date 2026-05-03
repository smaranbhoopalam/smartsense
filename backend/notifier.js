// ─── SmartSense Telegram Notifier ────────────────────────────────────────────
// Sends intrusion alerts via Telegram Bot API.
// Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env

class TelegramNotifier {
  /**
   * @param {string} botToken - Telegram bot token from @BotFather
   * @param {string} chatId - Target chat ID for alerts
   */
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.enabled = !!(botToken && chatId);
    this.lastSentAt = 0;
    this.cooldownMs = 30000; // 30-second cooldown between alerts

    if (!this.enabled) {
      console.log("[Notifier] Telegram not configured — notifications disabled");
    } else {
      console.log("[Notifier] Telegram notifications enabled");
    }
  }

  /**
   * Send an intrusion alert.
   * @param {Object} alert
   * @param {string} alert.type - 'UNKNOWN_DEVICE' or 'RSSI_ANOMALY'
   * @param {string} alert.message - Human-readable message
   * @param {string} [alert.mode] - Current security mode
   */
  async sendAlert(alert) {
    if (!this.enabled) return;

    // Cooldown to prevent spam
    const now = Date.now();
    if (now - this.lastSentAt < this.cooldownMs) {
      console.log("[Notifier] Cooldown active, skipping alert");
      return;
    }

    const emoji = alert.type === "UNKNOWN_DEVICE" ? "📱" : "📡";
    const text = [
      `🚨 *SmartSense Intrusion Alert*`,
      ``,
      `${emoji} *Type:* ${alert.type}`,
      `📝 *Details:* ${alert.message}`,
      `🔒 *Mode:* ${alert.mode || "SECURITY"}`,
      `🕐 *Time:* ${new Date().toLocaleString()}`,
      ``,
      `⚠️ _Check your SmartSense dashboard for details._`,
    ].join("\n");

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: "Markdown",
        }),
      });

      if (res.ok) {
        this.lastSentAt = now;
        console.log("[Notifier] Alert sent to Telegram");
      } else {
        const err = await res.text();
        console.error("[Notifier] Telegram API error:", err);
      }
    } catch (err) {
      console.error("[Notifier] Failed to send Telegram alert:", err.message);
    }
  }
}

module.exports = { TelegramNotifier };
