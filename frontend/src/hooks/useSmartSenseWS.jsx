// ─── SmartSense WebSocket Hook ───────────────────────────────────────────────
// Connects to backend WebSocket for real-time state updates.
// Falls back to simulated data if backend is unavailable.

import { useState, useEffect, useCallback, useRef } from "react";

const WS_URL = import.meta.env.VITE_SMARTSENSE_WS_URL || "ws://localhost:3001";
const API_URL = import.meta.env.VITE_SMARTSENSE_API_URL || "http://localhost:3001";
const MAX_HISTORY = 60; // 60 data points ≈ 30 seconds at 500ms interval

// ─── Simulation fallback ──────────────────────────────────────────
function generateSimData(prev) {
  let rssi = (prev?.rssi ?? -35) + (Math.random() - 0.48) * 2;
  rssi = Math.max(-55, Math.min(-15, rssi));

  let ldr = (prev?.ldr ?? 2500) + (Math.random() - 0.5) * 80;
  ldr = Math.max(100, Math.min(3800, ldr));

  const presence = rssi > -40;

  // Simple LED logic for simulation
  let ledLevel = 0;
  if (presence && ldr >= 800) {
    if (rssi > -25) ledLevel = 4;
    else if (rssi > -30) ledLevel = 3;
    else if (rssi > -35) ledLevel = 2;
    else ledLevel = 1;
  }

  return {
    rssi: Math.round(rssi * 100) / 100,
    ldr: Math.round(ldr),
    presence,
    ledLevel,
    leds: [ledLevel >= 1, ledLevel >= 2, ledLevel >= 3, ledLevel >= 4],
    rssiSmooth: Math.round(rssi * 100) / 100,
    ldrSmooth: Math.round(ldr),
    intrusion: false,
    intrusionType: null,
    buzzer: false,
    currentStddev: 0,
    alertHistory: [],
    mode: prev?.mode ?? "ENERGY",
    securityMode: prev?.securityMode ?? "DEVICE_FREE",
    serialConnected: false,
    simulating: true,
    lastUpdate: Date.now(),
  };
}

export function useSmartSenseWS() {
  const [state, setState] = useState(() => generateSimData(null));
  const [rssiHistory, setRssiHistory] = useState([]);
  const [ldrHistory, setLdrHistory] = useState([]);
  const [connected, setConnected] = useState(false);
  const [useMock, setUseMock] = useState(true);

  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const simRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Append to history ──────────────────────────────────────────
  const pushHistory = useCallback((rssi, ldr) => {
    const now = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setRssiHistory((prev) => {
      const next = [...prev, { time: now, value: rssi }];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });

    setLdrHistory((prev) => {
      const next = [...prev, { time: now, value: ldr }];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
  }, []);

  // ─── Start simulation ──────────────────────────────────────────
  const startSimulation = useCallback(() => {
    if (simRef.current) return;
    setUseMock(true);

    simRef.current = setInterval(() => {
      const newData = generateSimData(stateRef.current);
      setState(newData);
      pushHistory(newData.rssiSmooth ?? newData.rssi, newData.ldrSmooth ?? newData.ldr);
    }, 500);
  }, [pushHistory]);

  const stopSimulation = useCallback(() => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
  }, []);

  // ─── WebSocket connection ──────────────────────────────────────
  const connectWS = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[SmartSense WS] Connected");
        setConnected(true);
        setUseMock(false);
        stopSimulation();
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "state" && msg.data) {
            setState(msg.data);
            pushHistory(
              msg.data.rssiSmooth ?? msg.data.rssi,
              msg.data.ldrSmooth ?? msg.data.ldr
            );
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        console.log("[SmartSense WS] Disconnected");
        setConnected(false);
        wsRef.current = null;

        // Start simulation fallback
        startSimulation();

        // Attempt reconnect after 3 seconds
        // Using a wrapper function to avoid 'accessed before declared' lint error with useCallback
        reconnectRef.current = setTimeout(() => connectWS(), 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket constructor failed — start simulation
      startSimulation();
      reconnectRef.current = setTimeout(() => connectWS(), 5000);
    }
  }, [pushHistory, startSimulation, stopSimulation]);

  // ─── Lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    connectWS();

    return () => {
      stopSimulation();
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connectWS, stopSimulation]);

  // ─── API calls ──────────────────────────────────────────────────
  const setMode = useCallback(
    async (mode) => {
      // Optimistic update
      setState((prev) => ({ ...prev, mode }));

      if (!useMock) {
        try {
          await fetch(`${API_URL}/mode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode }),
          });
        } catch {
          console.warn("[SmartSense] Failed to set mode via API");
        }
      }
    },
    [useMock]
  );

  const setSecurityMode = useCallback(
    async (securityMode) => {
      setState((prev) => ({ ...prev, securityMode }));

      if (!useMock) {
        try {
          await fetch(`${API_URL}/security-mode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ securityMode }),
          });
        } catch {
          console.warn("[SmartSense] Failed to set security mode via API");
        }
      }
    },
    [useMock]
  );

  return {
    state,
    rssiHistory,
    ldrHistory,
    connected,
    useMock,
    setMode,
    setSecurityMode,
  };
}
