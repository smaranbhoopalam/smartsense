# 🚀 SmartSense: WiFi-Based Intelligent Occupancy & Intrusion Detection System

SmartSense is a **hybrid occupancy detection and security system** built on the **ESP32-S3**, designed to accurately detect human presence — even when a person is stationary — using a combination of:

* 📡 WiFi signal analysis (RSSI / CSI)
* 🌗 Light sensing (LDR)
* 🔄 Sensor fusion logic (FSM)
* 🤖 TinyML (future integration)

---

## 🎯 Problem Statement

Traditional systems like PIR sensors fail to detect **stationary humans**.

SmartSense solves this by combining **RF signal behavior + environmental sensing**, enabling:

* Accurate occupancy detection
* Intrusion alerts
* Smart automation triggers

---

## ⚙️ Features

* 📶 **WiFi Device Detection**

  * Tracks nearby devices using RSSI
  * Identifies proximity changes

* 📡 **RF-Based Human Detection (CSI - upcoming)**

  * Detects subtle signal disturbances caused by humans

* 🌗 **LDR-Based Environment Awareness**

  * Detects light/dark conditions
  * Improves contextual accuracy

* 🔁 **Finite State Machine (FSM)**

  * Intelligent state transitions:

    * NO_PERSON
    * POSSIBLE_PERSON
    * CONFIRMED_PERSON

* 🚨 **Alert System**

  * LED + Buzzer alert loop (10s ON / 10s OFF)
  * Designed like a real intrusion alarm

* ⚡ **Real-Time Processing**

  * Non-blocking logic using `millis()`

---

## 🧠 System Architecture

```
        +------------------+
        |   WiFi Sniffer   |
        | (RSSI / CSI)     |
        +--------+---------+
                 |
                 v
        +------------------+
        |  Sensor Fusion   |
        |  (FSM Logic)     |
        +--------+---------+
                 |
     +-----------+-----------+
     |                       |
     v                       v
+---------+           +-------------+
|   LDR   |           | Alert System|
| (Light) |           | LED+Buzzer  |
+---------+           +-------------+
```

---

## 🔌 Hardware Requirements

* ESP32-S3
* LDR (Light Dependent Resistor)
* Resistor (10k recommended for LDR divider)
* LED (x1 or multiple)
* Active Buzzer
* Breadboard & jumper wires

---

## 🔧 Pin Configuration

| Component | GPIO                |
| --------- | ------------------- |
| LDR       | 12                  |
| LED       | 4, 5, 16, 18        |
| Buzzer    | 5 (or configurable) |

---

## 💻 Software Stack

* Arduino Framework (ESP32)
* WiFi + ESP-IDF APIs (`esp_wifi.h`)
* TinyML (planned):

  * TensorFlow Lite Micro
  * Edge Impulse (optional)

---

## 🧪 Data Processing

### Current Metrics:

* RSSI thresholds:

  * Near: > -35 dBm
  * Medium: > -55 dBm
* LDR:

  * > 2000 → Dark
  * <1000 → Bright

### Planned:

* CSI Feature Extraction:

  * Mean Amplitude
  * Variance
  * Standard Deviation
* Temporal change detection

---

## 🔁 Alert Logic

* System triggers alert when intrusion detected
* Behavior:

  * 🔴 LED ON + 🔊 Buzzer ON → 10 seconds
  * OFF → 10 seconds
  * Repeats continuously

---

## 📁 Project Structure

```
SmartSense/
│
├── src/
│   ├── main.ino
│   ├── wifi_sniffer.cpp
│   ├── ldr_module.cpp
│   ├── fsm_logic.cpp
│
├── data/
│   ├── ldr_data.csv
│   ├── merged_dataset.csv
│
├── model/ (future)
│   ├── tflite_model.h
│
└── README.md
```

---

## 🚀 Getting Started

1. Clone the repo:

```
git clone https://github.com/your-username/smartsense.git
```

2. Open in Arduino IDE / VS Code

3. Select board:

```
ESP32-S3 Dev Module
```

4. Upload code

5. Monitor via Serial Monitor

---

## 🔮 Future Improvements

* 📡 Full CSI-based human detection
* 🤖 TinyML model deployment (TFLite Micro)
* 📱 Mobile notifications (IoT integration)
* ☁️ Cloud dashboard
* 🔋 Power optimization

---

## 💡 Use Cases

* Smart homes 🏠
* Security systems 🔐
* Energy optimization ⚡
* Office occupancy tracking 🧑‍💼

---

## 👨‍💻 Author

**Smaran Bhoopalam**

---

## ⭐ Contribution

Feel free to fork, improve, and contribute!

---

## 📜 License

MIT License
