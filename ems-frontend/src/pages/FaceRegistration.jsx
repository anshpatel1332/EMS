import React, { useEffect, useRef, useState } from "react";
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";

function FaceRegistration() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [captured, setCaptured] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => { fetchEmployees(); startCamera(); }, []);

  const fetchEmployees = async () => {
    try { const res = await API.get("/employees"); setEmployees(res.data); }
    catch (err) { console.error(err); }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setStatus("error:Camera permission denied or not available");
    }
  };

  const captureFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.7);
    setImage(imageData);
    setCaptured(true);
    setStatus("success:Face captured! Review and save.");
  };

  const retake = () => { setImage(""); setCaptured(false); setStatus(""); };

  const saveFace = async () => {
    if (!employee) { setStatus("error:Please select an employee first"); return; }
    if (!image) { setStatus("error:Please capture a face first"); return; }
    setSaving(true);
    try {
      await API.post("/api/face", { employee_id: employee, face_encoding: "base64_stored", image_url: image });
      setStatus("success:Face registered successfully!");
      setImage(""); setCaptured(false); setEmployee("");
    } catch (err) {
      setStatus("error:" + (err.response?.data?.error || "Failed to save face"));
    } finally { setSaving(false); }
  };

  const statusType = status.startsWith("success:") ? "success" : status.startsWith("error:") ? "error" : "";
  const statusMsg = status.replace(/^(success:|error:)/, "");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .fr-page { min-height:100vh; background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); font-family:'Inter',sans-serif; padding:2rem 1rem; }
        .fr-wrap { max-width:800px; margin:0 auto; }
        .fr-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:2rem; flex-wrap:wrap; }
        .fr-back { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#ccc; padding:0.5rem 1.1rem; border-radius:12px; cursor:pointer; font-size:0.9rem; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .fr-back:hover { background:rgba(255,255,255,0.15); color:#fff; }
        .fr-icon { width:52px; height:52px; background:linear-gradient(135deg,#8b5cf6,#ec4899); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow:0 8px 20px rgba(139,92,246,0.4); }
        .fr-title { color:#fff; font-size:1.6rem; font-weight:700; margin:0; }
        .fr-subtitle { color:rgba(255,255,255,0.4); font-size:0.85rem; margin:0.2rem 0 0; }
        .fr-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        @media(max-width:700px){ .fr-grid{ grid-template-columns:1fr; } }
        .fr-card { background:rgba(255,255,255,0.05); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.1); border-radius:20px; overflow:hidden; }
        .fr-card-header { padding:1rem 1.5rem; background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; gap:0.6rem; }
        .fr-card-title { color:rgba(255,255,255,0.8); font-size:0.85rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
        .fr-card-body { padding:1.25rem; }
        .fr-label { display:block; color:rgba(255,255,255,0.5); font-size:0.78rem; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.5rem; }
        .fr-select { width:100%; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:0.85rem 1rem; color:#fff; font-size:0.95rem; font-family:'Inter',sans-serif; outline:none; cursor:pointer; transition:all 0.2s; }
        .fr-select:focus { border-color:rgba(139,92,246,0.6); box-shadow:0 0 0 3px rgba(139,92,246,0.15); }
        .fr-select option { background:#1e1b4b; }
        .fr-camera { position:relative; border-radius:16px; overflow:hidden; background:#000; aspect-ratio:4/3; }
        .fr-video { width:100%; height:100%; object-fit:cover; display:block; }
        .fr-preview { width:100%; height:100%; object-fit:cover; display:block; border-radius:16px; }
        .fr-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
        .fr-scan-ring { width:200px; height:200px; border:3px solid rgba(139,92,246,0.6); border-radius:50%; animation:scanPulse 2s ease-in-out infinite; position:relative; }
        .fr-scan-ring::before { content:''; position:absolute; inset:8px; border:2px solid rgba(139,92,246,0.3); border-radius:50%; }
        @keyframes scanPulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.05);opacity:1} }
        .fr-captured-badge { position:absolute; top:1rem; right:1rem; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:0.75rem; font-weight:700; padding:0.4rem 0.8rem; border-radius:20px; }
        .fr-steps { display:flex; flex-direction:column; gap:0.75rem; }
        .fr-step { display:flex; align-items:center; gap:0.75rem; padding:0.9rem 1rem; border-radius:14px; border:1px solid rgba(255,255,255,0.08); transition:all 0.2s; }
        .fr-step.done { background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.3); }
        .fr-step.active { background:rgba(139,92,246,0.12); border-color:rgba(139,92,246,0.4); }
        .fr-step.idle { background:rgba(255,255,255,0.03); }
        .fr-step-num { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:700; flex-shrink:0; }
        .fr-step.done .fr-step-num { background:#10b981; color:#fff; }
        .fr-step.active .fr-step-num { background:linear-gradient(135deg,#8b5cf6,#ec4899); color:#fff; }
        .fr-step.idle .fr-step-num { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); }
        .fr-step-label { color:rgba(255,255,255,0.7); font-size:0.9rem; font-weight:500; }
        .fr-step.done .fr-step-label { color:#6ee7b7; }
        .fr-step.active .fr-step-label { color:#c4b5fd; }
        .fr-divider { height:1px; background:rgba(255,255,255,0.07); margin:1rem 0; }
        .fr-info { background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.25); border-radius:12px; padding:0.9rem 1rem; }
        .fr-info-label { color:rgba(255,255,255,0.45); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.3rem; }
        .fr-info-val { color:#93c5fd; font-weight:600; font-size:0.9rem; }
        .fr-btn-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-top:1rem; }
        .fr-btn { border:none; border-radius:14px; padding:0.85rem 1rem; font-weight:600; font-size:0.9rem; cursor:pointer; transition:all 0.25s; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
        .fr-btn-capture { background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:#fff; }
        .fr-btn-capture:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(139,92,246,0.5); }
        .fr-btn-retake { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#ccc; }
        .fr-btn-retake:hover { background:rgba(255,255,255,0.15); color:#fff; }
        .fr-btn-save { background:linear-gradient(135deg,#10b981,#059669); color:#fff; }
        .fr-btn-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 20px rgba(16,185,129,0.4); }
        .fr-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
        .fr-status { margin-top:1rem; padding:0.85rem 1rem; border-radius:12px; font-size:0.88rem; font-weight:500; display:flex; align-items:center; gap:0.5rem; }
        .fr-status.success { background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#6ee7b7; }
        .fr-status.error { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; }
      `}</style>

      <div className="fr-page">
        <div className="fr-wrap">
          <div className="fr-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="fr-icon">🪪</div>
              <div>
                <h1 className="fr-title">Face Registration</h1>
                <p className="fr-subtitle">Register employee biometric identity</p>
              </div>
            </div>
            <button className="fr-back" onClick={() => navigate("/admin")}>
              ← Dashboard
            </button>
          </div>

          <div className="fr-grid">
            {/* Left — Camera */}
            <div>
              <div className="fr-card" style={{ marginBottom: "1.25rem" }}>
                <div className="fr-card-header">
                  <span>🎥</span>
                  <span className="fr-card-title">{captured ? "Captured Photo" : "Live Camera"}</span>
                </div>
                <div className="fr-card-body">
                  <div className="fr-camera">
                    {captured ? (
                      <>
                        <img src={image} alt="captured" className="fr-preview" />
                        <div className="fr-captured-badge">✓ Captured</div>
                      </>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted className="fr-video" />
                        <div className="fr-overlay">
                          <div className="fr-scan-ring" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="fr-btn-row">
                    {!captured ? (
                      <button className="fr-btn fr-btn-capture" style={{ gridColumn: "1/-1" }} onClick={captureFace}>
                        📸 Capture Face
                      </button>
                    ) : (
                      <>
                        <button className="fr-btn fr-btn-retake" onClick={retake}>🔄 Retake</button>
                        <button className="fr-btn fr-btn-save" onClick={saveFace} disabled={saving}>
                          {saving ? "⏳ Saving..." : "💾 Save Face"}
                        </button>
                      </>
                    )}
                  </div>

                  {statusMsg && (
                    <div className={`fr-status ${statusType}`}>
                      {statusType === "success" ? "✅" : "❌"} {statusMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Employee + Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="fr-card">
                <div className="fr-card-header">
                  <span>👤</span>
                  <span className="fr-card-title">Select Employee</span>
                </div>
                <div className="fr-card-body">
                  <label className="fr-label">Employee</label>
                  <select className="fr-select" value={employee} onChange={(e) => setEmployee(e.target.value)}>
                    <option value="">-- Choose employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>
                    ))}
                  </select>

                  {employee && (
                    <>
                      <div className="fr-divider" />
                      <div className="fr-info">
                        <div className="fr-info-label">Selected</div>
                        <div className="fr-info-val">
                          {employees.find(e => String(e.id) === String(employee))?.name || "—"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="fr-card">
                <div className="fr-card-header">
                  <span>📋</span>
                  <span className="fr-card-title">Registration Steps</span>
                </div>
                <div className="fr-card-body">
                  <div className="fr-steps">
                    <div className={`fr-step ${employee ? "done" : "active"}`}>
                      <div className="fr-step-num">{employee ? "✓" : "1"}</div>
                      <span className="fr-step-label">Select employee</span>
                    </div>
                    <div className={`fr-step ${captured ? "done" : employee ? "active" : "idle"}`}>
                      <div className="fr-step-num">{captured ? "✓" : "2"}</div>
                      <span className="fr-step-label">Capture face photo</span>
                    </div>
                    <div className={`fr-step ${statusType === "success" ? "done" : captured && employee ? "active" : "idle"}`}>
                      <div className="fr-step-num">{statusType === "success" ? "✓" : "3"}</div>
                      <span className="fr-step-label">Save biometric data</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    </>
  );
}

export default FaceRegistration;