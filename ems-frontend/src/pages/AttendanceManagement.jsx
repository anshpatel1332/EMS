import React, { useEffect, useState } from "react";
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";

function AttendanceManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { fetchAttendance(); }, []);

  useEffect(() => {
    let result = data;
    if (search) result = result.filter(r =>
      r.employee?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.employee_id).includes(search)
    );
    if (statusFilter !== "All") result = result.filter(r => r.status === statusFilter);
    setFiltered(result);
  }, [search, statusFilter, data]);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/api/attendance");
      setData(res.data);
      setFiltered(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => {
    if (!d) return "--";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (t) => {
    if (!t) return "--";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const stats = {
    total: data.length,
    present: data.filter(d => d.status === "Present").length,
    late: data.filter(d => d.status === "Late").length,
    absent: data.filter(d => d.status === "Absent").length,
  };

  const statusColor = (s) => {
    if (s === "Present") return "#10b981";
    if (s === "Late") return "#f59e0b";
    return "#ef4444";
  };

  const statusBg = (s) => {
    if (s === "Present") return "rgba(16,185,129,0.15)";
    if (s === "Late") return "rgba(245,158,11,0.15)";
    return "rgba(239,68,68,0.15)";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .am-page { min-height:100vh; background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); font-family:'Inter',sans-serif; padding:2rem 1rem; }
        .am-wrap { max-width:1100px; margin:0 auto; }
        .am-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:2rem; flex-wrap:wrap; }
        .am-back { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#ccc; padding:0.5rem 1.1rem; border-radius:12px; cursor:pointer; font-size:0.9rem; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .am-back:hover { background:rgba(255,255,255,0.15); color:#fff; }
        .am-icon { width:52px; height:52px; background:linear-gradient(135deg,#3b82f6,#06b6d4); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; box-shadow:0 8px 20px rgba(59,130,246,0.4); }
        .am-title { color:#fff; font-size:1.6rem; font-weight:700; margin:0; }
        .am-subtitle { color:rgba(255,255,255,0.4); font-size:0.85rem; margin:0.2rem 0 0; }
        .am-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
        @media(max-width:700px){ .am-stats{ grid-template-columns:1fr 1fr; } }
        .am-stat { background:rgba(255,255,255,0.05); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:1.25rem; text-align:center; }
        .am-stat-num { font-size:2rem; font-weight:700; line-height:1; }
        .am-stat-label { color:rgba(255,255,255,0.45); font-size:0.8rem; margin-top:0.4rem; }
        .am-toolbar { display:flex; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap; align-items:center; }
        .am-search { flex:1; min-width:200px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:0.75rem 1rem 0.75rem 2.8rem; color:#fff; font-size:0.9rem; font-family:'Inter',sans-serif; outline:none; transition:all 0.2s; }
        .am-search:focus { border-color:rgba(59,130,246,0.5); box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .am-search::placeholder { color:rgba(255,255,255,0.25); }
        .am-search-wrap { position:relative; flex:1; }
        .am-search-icon { position:absolute; left:0.9rem; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.3); font-size:0.95rem; pointer-events:none; }
        .am-filter-btns { display:flex; gap:0.5rem; }
        .am-filter-btn { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0.6rem 1rem; color:rgba(255,255,255,0.55); font-size:0.85rem; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; }
        .am-filter-btn.active { background:rgba(59,130,246,0.25); border-color:rgba(59,130,246,0.5); color:#93c5fd; font-weight:600; }
        .am-refresh-btn { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:0.75rem 1.1rem; color:#ccc; font-size:0.85rem; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; white-space:nowrap; }
        .am-refresh-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }
        .am-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.09); border-radius:20px; overflow:hidden; }
        .am-table { width:100%; border-collapse:collapse; }
        .am-thead th { padding:0.85rem 1.25rem; text-align:left; color:rgba(255,255,255,0.4); font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid rgba(255,255,255,0.07); background:rgba(0,0,0,0.2); }
        .am-tbody tr { border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s; }
        .am-tbody tr:last-child { border-bottom:none; }
        .am-tbody tr:hover { background:rgba(255,255,255,0.04); }
        .am-td { padding:1rem 1.25rem; color:rgba(255,255,255,0.8); font-size:0.9rem; vertical-align:middle; }
        .am-emp-name { font-weight:600; color:#fff; }
        .am-emp-id { font-size:0.78rem; color:rgba(255,255,255,0.35); margin-top:0.15rem; }
        .am-badge { display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.78rem; font-weight:600; }
        .am-dot { width:6px; height:6px; border-radius:50%; }
        .am-empty { text-align:center; padding:4rem 2rem; }
        .am-empty-icon { font-size:3rem; margin-bottom:1rem; opacity:0.4; }
        .am-empty-text { color:rgba(255,255,255,0.3); font-size:0.95rem; }
        .am-loading { text-align:center; padding:4rem; }
        .am-spinner { width:40px; height:40px; border:3px solid rgba(255,255,255,0.1); border-top-color:#8b5cf6; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 1rem; }
        @keyframes spin { to{ transform:rotate(360deg); } }
        .am-count { color:rgba(255,255,255,0.35); font-size:0.82rem; padding:1rem 1.25rem; border-top:1px solid rgba(255,255,255,0.06); }
      `}</style>

      <div className="am-page">
        <div className="am-wrap">
          {/* Header */}
          <div className="am-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="am-icon">📊</div>
              <div>
                <h1 className="am-title">Attendance Management</h1>
                <p className="am-subtitle">Track and monitor employee attendance records</p>
              </div>
            </div>
            <button className="am-back" onClick={() => navigate("/admin")}>
              ← Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="am-stats">
            <div className="am-stat">
              <div className="am-stat-num" style={{ color: "#a78bfa" }}>{stats.total}</div>
              <div className="am-stat-label">Total Records</div>
            </div>
            <div className="am-stat">
              <div className="am-stat-num" style={{ color: "#10b981" }}>{stats.present}</div>
              <div className="am-stat-label">Present</div>
            </div>
            <div className="am-stat">
              <div className="am-stat-num" style={{ color: "#f59e0b" }}>{stats.late}</div>
              <div className="am-stat-label">Late</div>
            </div>
            <div className="am-stat">
              <div className="am-stat-num" style={{ color: "#ef4444" }}>{stats.absent}</div>
              <div className="am-stat-label">Absent</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="am-toolbar">
            <div className="am-search-wrap">
              <span className="am-search-icon">🔍</span>
              <input className="am-search" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="am-filter-btns">
              {["All", "Present", "Late", "Absent"].map(s => (
                <button key={s} className={`am-filter-btn ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
            <button className="am-refresh-btn" onClick={() => { setLoading(true); fetchAttendance(); }}>🔄 Refresh</button>
          </div>

          {/* Table */}
          <div className="am-card">
            {loading ? (
              <div className="am-loading">
                <div className="am-spinner"></div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem" }}>Loading attendance records...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="am-empty">
                <div className="am-empty-icon">📭</div>
                <div className="am-empty-text">{search || statusFilter !== "All" ? "No records match your filters" : "No attendance records found"}</div>
              </div>
            ) : (
              <>
                <table className="am-table">
                  <thead className="am-thead">
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="am-tbody">
                    {filtered.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="am-td" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>{idx + 1}</td>
                        <td className="am-td">
                          <div className="am-emp-name">{item.employee || "Unknown"}</div>
                          <div className="am-emp-id">ID: {item.employee_id}</div>
                        </td>
                        <td className="am-td">{formatDate(item.date)}</td>
                        <td className="am-td" style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>{formatTime(item.time)}</td>
                        <td className="am-td">
                          <span className="am-badge" style={{ background: statusBg(item.status), color: statusColor(item.status) }}>
                            <span className="am-dot" style={{ background: statusColor(item.status) }}></span>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="am-count">Showing {filtered.length} of {data.length} records</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AttendanceManagement;