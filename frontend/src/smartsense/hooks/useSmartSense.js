import { useState, useEffect, useCallback } from "react";
import {
  mockStatus,
  mockDevices,
  mockAnalytics,
  mockEnergy,
  mockAlerts,
  mockInsights,
  mockRooms,
} from "../mockData";

const SMARTSENSE_BASE = import.meta.env.VITE_SMARTSENSE_API_URL || null;

async function apiFetch(path, options = {}) {
  if (!SMARTSENSE_BASE) throw new Error("No API");
  const res = await fetch(`${SMARTSENSE_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useSmartSense() {
  const [status, setStatus] = useState(mockStatus);
  const [devices, setDevices] = useState(mockDevices);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [energy, setEnergy] = useState(mockEnergy);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [insights] = useState(mockInsights);
  const [rooms, setRooms] = useState(mockRooms);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [useMock, setUseMock] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, al] = await Promise.all([
        apiFetch("/status"),
        apiFetch("/analytics"),
        apiFetch("/alerts"),
      ]);
      setStatus(s);
      setAnalytics(a);
      setAlerts(al);
      setUseMock(false);
    } catch {
      // Fall back to mock data silently
      setUseMock(true);
      // Simulate live fluctuation on mock data
      setStatus((prev) => ({
        ...prev,
        confidence: Math.min(100, Math.max(0, prev.confidence + (Math.random() * 6 - 3))),
        deviceCount: prev.deviceCount,
        lastUpdated: new Date().toISOString(),
      }));
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  const toggleDevice = useCallback(async (deviceKey) => {
    const newVal = !devices[deviceKey];
    setDevices((prev) => ({ ...prev, [deviceKey]: newVal }));
    try {
      await apiFetch("/control", {
        method: "POST",
        body: JSON.stringify({ device: deviceKey, state: newVal }),
      });
    } catch {
      // Mock: keep optimistic update
    }
  }, [devices]);

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  }, []);

  const toggleRoomDevice = useCallback((roomId, deviceKey) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, [deviceKey]: !r[deviceKey] } : r
      )
    );
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return {
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
    refresh: fetchAll,
  };
}
