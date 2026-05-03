import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { api } from "../api";

// Fix Leaflet's default icon paths broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom green marker for hospitals
const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom blue marker for user location
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Recenter map when coords change
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [selected, setSelected] = useState(null);

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    setHospitals([]);
    setSelected(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await api.nearbyHospitals(latitude, longitude);
          if (res.status === "Success") {
            setHospitals(res.data || []);
            if ((res.data || []).length === 0)
              setError("No hospitals found within 5km. Try a wider area.");
          } else {
            setError(res.message || "Failed to fetch hospitals.");
          }
        } catch {
          setError("Cannot connect to backend. Make sure it's running on port 8000.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError("Location permission denied. Please allow location access in your browser settings.");
        else if (err.code === 2) setError("Your location is currently unavailable. Try again.");
        else setError("Could not get your location. Please try again.");
      },
      { timeout: 10000 }
    );
  };

  const mapCenter = coords ? [coords.lat, coords.lng] : [20.5937, 78.9629]; // default: India center

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-2 text-white text-center">Nearby Hospitals</h1>
        <p className="text-slate-400 text-center mb-8">
          Find hospitals and clinics within 5km of your location — powered by OpenStreetMap.
        </p>

        {/* Search button */}
        <div className="text-center mb-6">
          <button
            onClick={findNearby}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black py-4 px-10 rounded-2xl text-lg transition-all shadow-xl shadow-emerald-500/20 inline-flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {loading ? "Searching..." : "Find Hospitals Near Me"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* Map + List layout */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* MAP */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-700 h-[480px]">
            <MapContainer
              center={mapCenter}
              zoom={coords ? 14 : 5}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={coords ? [coords.lat, coords.lng] : null} />

              {/* User location */}
              {coords && (
                <>
                  <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
                    <Popup>
                      <div className="text-sm font-bold">📍 You are here</div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[coords.lat, coords.lng]}
                    radius={5000}
                    pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.05, weight: 1.5 }}
                  />
                </>
              )}

              {/* Hospital markers */}
              {hospitals.map((h, i) => (
                <Marker
                  key={i}
                  position={[h.lat, h.lng]}
                  icon={hospitalIcon}
                  eventHandlers={{ click: () => setSelected(h) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-base mb-1">{h.name}</p>
                      <p className="text-gray-600 mb-1">{h.address}</p>
                      {h.phone && <p>📞 {h.phone}</p>}
                      {h.emergency === "yes" && <p className="text-red-600 font-bold">🚨 Emergency</p>}
                      {h.website && (
                        <a href={h.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                          Website →
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* HOSPITAL LIST */}
          <div className="lg:col-span-2 space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {loading && (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-xl animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slatelet-700 rounded w-1/2" />
                  </div>
                ))}
              </>
            )}

            {!loading && hospitals.length === 0 && !error && (
              <div className="text-center text-slate-500 py-16">
                <p className="text-4xl mb-3">🏥</p>
                <p className="text-sm">Click the button to find hospitals near you.</p>
              </div>
            )}

            {hospitals.map((h, i) => (
              <button
                key={i}
                onClick={() => setSelected(h)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?.name === h.name
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-slate-800 border-slate-700 hover:border-emerald-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 font-black text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{h.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{h.address}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {h.emergency === "yes" && (
                        <span className="text-xs text-red-400 font-bold">🚨 Emergency</span>
                      )}
                      {h.type === "clinic" && (
                        <span className="text-xs text-blue-400">🏥 Clinic</span>
                      )}
                      {h.phone && (
                        <span className="text-xs text-slate-500">{h.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected hospital detail card */}
        {selected && (
          <div className="mt-6 p-5 bg-slate-800 border border-emerald-500/30 rounded-2xl flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg">{selected.name}</p>
              <p className="text-slate-400 text-sm mt-1">{selected.address}</p>
              <div className="flex gap-4 mt-2 flex-wrap">
                {selected.phone && <p className="text-slate-300 text-sm">📞 {selected.phone}</p>}
                {selected.emergency === "yes" && <p className="text-red-400 text-sm font-bold">🚨 Has Emergency</p>}
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noopener noreferrer"
                    className="text-emerald-400 text-sm underline hover:text-emerald-300">
                    Website →
                  </a>
                )}
              </div>
            </div>
            <a
              href={`https://www.openstreetmap.org/directions?from=${coords?.lat},${coords?.lng}&to=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all"
            >
              Get Directions
            </a>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">
          Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
        </p>
      </div>
    </div>
  );
}
