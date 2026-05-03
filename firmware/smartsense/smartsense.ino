// ─── SmartSense ESP32 Firmware ────────────────────────────────────────────────
// Dual-mode IoT firmware: ENERGY (LED control) / SECURITY (intrusion detection)
// Outputs JSON over Serial for backend consumption.
// Accepts JSON commands from backend to switch modes and control outputs.
//
// Pin Configuration:
//   LDR    → GPIO 12  (analog input)
//   BUZZER → GPIO 21  (passive buzzer, tone output)
//   LED 1  → GPIO 4
//   LED 2  → GPIO 5
//   LED 3  → GPIO 16
//   LED 4  → GPIO 18

#include <WiFi.h>
#include <ArduinoJson.h>

// ──────── WiFi ────────
const char* ssid = "Wifi";
const char* password = "55777257082";

// ──────── Pins ────────
#define LDR_PIN     12
#define BUZZER_PIN  21
int ledPins[4] = {4, 5, 16, 18};

// ──────── EMA Filter ────────
float alpha = 0.2;
float rssiSmooth = -60;
float ldrSmooth = 0;
float prevRSSI = -60;

// ──────── Timing ────────
unsigned long lastRead = 0;
int readInterval = 500;  // 500ms between readings

// ──────── Buzzer Timer ────────
unsigned long buzzerOnTime = 0;
bool buzzerActive = false;

// ──────── Mode Control ────────
// Modes: "ENERGY" or "SECURITY"
// Security sub-modes: "DEVICE_BASED" or "DEVICE_FREE"
String currentMode = "ENERGY";
String securityMode = "DEVICE_FREE";

// ──────── LED level (can be overridden by backend) ────────
int ledLevel = 0;
bool backendLedControl = false;  // true = backend controls LEDs

// ──────── LDR Read (multi-sample average) ────────
int readLDR() {
  int sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(LDR_PIN);
    delay(2);
  }
  return sum / 10;
}

// ──────── LED Control ────────
void setLEDs(int level) {
  for (int i = 0; i < 4; i++) {
    digitalWrite(ledPins[i], i < level ? HIGH : LOW);
  }
}

// ──────── Parse Serial Commands from Backend ────────
void processSerialInput() {
  if (!Serial.available()) return;

  String line = Serial.readStringUntil('\n');
  line.trim();
  if (line.length() == 0) return;

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, line);
  if (err) return;

  const char* cmd = doc["cmd"];
  if (!cmd) return;

  if (strcmp(cmd, "mode") == 0) {
    const char* m = doc["mode"];
    if (m) {
      currentMode = String(m);
      // Reset outputs on mode switch
      if (currentMode == "ENERGY") {
        digitalWrite(BUZZER_PIN, LOW);
        buzzerActive = false;
      } else {
        setLEDs(0);
        ledLevel = 0;
      }
    }
  }
  else if (strcmp(cmd, "securityMode") == 0) {
    const char* sm = doc["securityMode"];
    if (sm) securityMode = String(sm);
  }
  else if (strcmp(cmd, "leds") == 0) {
    int level = doc["level"] | -1;
    if (level >= 0 && level <= 4) {
      ledLevel = level;
      backendLedControl = true;
      setLEDs(level);
    }
  }
  else if (strcmp(cmd, "buzzer") == 0) {
    bool on = doc["on"] | false;
    if (on) {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerOnTime = millis();
      buzzerActive = true;
    } else {
      digitalWrite(BUZZER_PIN, LOW);
      buzzerActive = false;
    }
  }
}

// ──────── SETUP ────────
void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  for (int i = 0; i < 4; i++) {
    pinMode(ledPins[i], OUTPUT);
  }

  analogReadResolution(12);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

// ──────── LOOP ────────
void loop() {
  // Check for serial commands from backend
  processSerialInput();

  if (millis() - lastRead >= readInterval) {
    lastRead = millis();

    // Read sensors
    int rssiRaw = WiFi.RSSI();
    int ldrRaw = readLDR();

    // Apply EMA filter
    rssiSmooth = alpha * rssiRaw + (1 - alpha) * rssiSmooth;
    ldrSmooth = alpha * ldrRaw + (1 - alpha) * ldrSmooth;

    // Determine presence (RSSI-based proxy)
    bool presence = rssiSmooth > -40;

    bool intrusion = false;

    if (currentMode == "ENERGY") {
      // ──── ENERGY MODE ────
      // Local LED logic (used when backend is not controlling)
      if (!backendLedControl) {
        if (rssiSmooth < -40) {
          ledLevel = 0;
        } else {
          if (ldrSmooth > 2000) {
            ledLevel = 4;  // Dark → full light
          } else {
            ledLevel = 2;  // Bright → low light
          }
        }
        setLEDs(ledLevel);
      }

      // Buzzer OFF in energy mode
      digitalWrite(BUZZER_PIN, LOW);
      buzzerActive = false;

    } else {
      // ──── SECURITY MODE ────
      // LEDs OFF in security mode
      setLEDs(0);
      ledLevel = 0;

      // Intrusion detection (device-free: RSSI fluctuation)
      float diff = abs(rssiSmooth - prevRSSI);
      if (diff > 5) {
        intrusion = true;
        buzzerOnTime = millis();
        buzzerActive = true;
      }

      // Buzzer control with 2-second duration
      if (buzzerActive && millis() - buzzerOnTime < 2000) {
        digitalWrite(BUZZER_PIN, HIGH);
      } else if (!buzzerActive || millis() - buzzerOnTime >= 2000) {
        digitalWrite(BUZZER_PIN, LOW);
        if (millis() - buzzerOnTime >= 2000) buzzerActive = false;
      }
    }

    prevRSSI = rssiSmooth;

    // ──── Output JSON to Serial ────
    StaticJsonDocument<256> out;
    out["rssi"] = round(rssiSmooth * 100) / 100.0;
    out["ldr"] = round(ldrSmooth);
    out["presence"] = presence;
    out["ledLevel"] = ledLevel;
    out["intrusion"] = intrusion;
    out["mode"] = currentMode;
    out["securityMode"] = securityMode;
    out["buzzer"] = buzzerActive;

    serializeJson(out, Serial);
    Serial.println();
  }
}
