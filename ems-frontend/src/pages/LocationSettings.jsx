import React, { useEffect, useState } from "react";
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";

function LocationSettings() {
  const navigate = useNavigate();
  const [location, setLocation] = useState({ office_name: "", latitude: "", longitude: "", radius: 100 });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchLocation(); }, []);

  const fetchLocation = async () => {
    try {
      const res = await API.get("/api/location");
      if (res.data) setLocation(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => setLocation({ ...location, [e.target.name]: e.target.value });

  const getCurrentLocation = () => {
    setFetching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setFetching(false);
        showToast("success", "Location fetched successfully!");
      },
      () => { setFetching(false); showToast("error", "Unable to fetch location"); }
    );
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/api/location", location);
      showToast("success", "Office location saved!");
    } catch {
      showToast("error", "Failed to update location");
    } finally { setSaving(false); }
  };

  const radiusOptions = [50, 100, 200, 500];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .ls-page { min-height: 100vh; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); font-family: 'Inter', sans-serif; padding: 2rem 1rem; }
        .ls-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 2.5rem; max-width: 680px; margin: 0 auto; box-shadow: 0 25px 50px rgba(0,0,0,0.4); }
        .ls-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .ls-title { font-size: 1.6rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.6rem; }
        .ls-back { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #ccc; padding: 0.5rem 1.1rem; border-radius: 12px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .ls-back:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .ls-label { display: block; color: rgba(255,255,255,0.6); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem; }
        .ls-input { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.85rem 1.1rem; color: #fff; font-size: 0.95rem; font-family: 'Inter', sans-serif; transition: all 0.2s; outline: none; }
        .ls-input:focus { border-color: rgba(139,92,246,0.6); background: rgba(139,92,246,0.1); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
        .ls-input::placeholder { color: rgba(255,255,255,0.25); }
        .ls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media(max-width:560px){ .ls-grid { grid-template-columns: 1fr; } }
        .ls-group { margin-bottom: 1.25rem; }
        .ls-coords { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15)); border: 1px solid rgba(139,92,246,0.3); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .ls-pin { width: 48px; height: 48px; background: linear-gradient(135deg,#8b5cf6,#3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; box-shadow: 0 0 20px rgba(139,92,246,0.5); }
        .ls-coord-text { flex: 1; }
        .ls-coord-text h4 { color: #fff; font-size: 0.85rem; font-weight: 600; margin: 0 0 0.4rem; }
        .ls-coord-val { color: rgba(255,255,255,0.5); font-size: 0.8rem; font-family: monospace; }
        .ls-radius-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.75rem; }
        .ls-radius-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.7rem 0.5rem; color: rgba(255,255,255,0.6); font-size: 0.85rem; cursor: pointer; transition: all 0.2s; text-align: center; font-family: 'Inter', sans-serif; }
        .ls-radius-btn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.4); color: #fff; }
        .ls-radius-btn.active { background: linear-gradient(135deg,rgba(139,92,246,0.4),rgba(59,130,246,0.4)); border-color: rgba(139,92,246,0.7); color: #fff; font-weight: 600; }
        .ls-radius-val { font-size: 1.1rem; font-weight: 700; color: #a78bfa; display: block; }
        .ls-actions { display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .ls-btn-gps { flex: 1; min-width: 160px; background: linear-gradient(135deg,#10b981,#059669); border: none; border-radius: 14px; padding: 0.9rem 1.5rem; color: #fff; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: 'Inter', sans-serif; }
        .ls-btn-gps:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(16,185,129,0.4); }
        .ls-btn-save { flex: 1; min-width: 160px; background: linear-gradient(135deg,#8b5cf6,#6d28d9); border: none; border-radius: 14px; padding: 0.9rem 1.5rem; color: #fff; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: 'Inter', sans-serif; }
        .ls-btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(139,92,246,0.5); }
        .ls-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .ls-pulse { display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.5} }
        .ls-toast { position: fixed; top: 1.5rem; right: 1.5rem; padding: 1rem 1.5rem; border-radius: 14px; font-weight: 600; font-size: 0.9rem; z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 0.6rem; font-family: 'Inter', sans-serif; }
        .ls-toast.success { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 8px 25px rgba(16,185,129,0.4); }
        .ls-toast.error { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; box-shadow: 0 8px 25px rgba(239,68,68,0.4); }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        .ls-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
      `}</style>

      {toast && <div className={`ls-toast ${toast.type}`}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}</div>}

      <div className="ls-page">
        <div className="ls-card">
          <div className="ls-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button className="ls-back" onClick={() => navigate("/admin")}>← Dashboard</button>
              <div className="ls-title">📍 Location Settings</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="ls-pulse"></span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>GPS Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Office Name */}
            <div className="ls-group">
              <label className="ls-label">🏢 Office Name</label>
              <input className="ls-input" type="text" name="office_name" value={location.office_name || ""} onChange={handleChange} placeholder="e.g. Head Office, Branch A..." />
            </div>

            <div className="ls-divider" />

            {/* Coordinates */}
            <div className="ls-coords">
              <div className="ls-pin">📌</div>
              <div className="ls-coord-text">
                <h4>Office Coordinates</h4>
                <div className="ls-coord-val">Lat: {location.latitude || "--"} &nbsp;|&nbsp; Lng: {location.longitude || "--"}</div>
              </div>
            </div>

            <div className="ls-grid ls-group">
              <div>
                <label className="ls-label">Latitude</label>
                <input className="ls-input" type="number" step="any" name="latitude" value={location.latitude || ""} onChange={handleChange} placeholder="22.5525" />
              </div>
              <div>
                <label className="ls-label">Longitude</label>
                <input className="ls-input" type="number" step="any" name="longitude" value={location.longitude || ""} onChange={handleChange} placeholder="72.9552" />
              </div>
            </div>

            <div className="ls-divider" />

            {/* Radius */}
            <div className="ls-group">
              <label className="ls-label" style={{ marginBottom: "0.75rem" }}>📡 Allowed Radius</label>
              <div className="ls-radius-grid">
                {radiusOptions.map((r) => (
                  <button key={r} type="button" className={`ls-radius-btn ${parseInt(location.radius) === r ? "active" : ""}`}
                    onClick={() => setLocation({ ...location, radius: r })}>
                    <span className="ls-radius-val">{r}</span>
                    meters
                  </button>
                ))}
              </div>
            </div>

            <div className="ls-divider" />

            {/* Action Buttons */}
            <div className="ls-actions">
              <button type="button" className="ls-btn-gps" onClick={getCurrentLocation} disabled={fetching}>
                {fetching ? <><span className="ls-pulse"></span> Locating...</> : <>📡 Use My Location</>}
              </button>
              <button type="submit" className="ls-btn-save" disabled={saving}>
                {saving ? "⏳ Saving..." : "💾 Save Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default LocationSettings;