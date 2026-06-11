import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaCheckCircle, FaClock, FaCalendarAlt, FaUmbrellaBeach } from "react-icons/fa";
import { Modal } from "bootstrap";
import API from "../Services/Api";
import "./EmployeeDashboard.css";
import "./LeaveEmployee.css";

function EmployeeLeave() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form state
  const [form, setForm] = useState({
    type: "", startDate: "", endDate: "", reason: "", attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    if (!user.id) return;
    try {
      setLoading(true);
      const res = await API.get(`/api/leaves/my/${user.id}`);
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const validate = () => {
    const e = {};
    if (!form.type) e.type = "Please select a leave type.";
    if (!form.startDate) e.startDate = "Start date is required.";
    if (!form.endDate) e.endDate = "End date is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date.";
    if (!form.reason || form.reason.trim().length < 10)
      e.reason = "Reason must be at least 10 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const empId = user.id ? parseInt(user.id, 10) : null;
      await API.post("/api/leaves", {
        employee_id: empId,
        leave_type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
        attachment_url: null,
      });

      // Clear form
      setForm({ type: "", startDate: "", endDate: "", reason: "", attachment: null });
      setErrors({});

      // Close modal
      const modalElement = document.getElementById("applyLeaveModal");
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal?.hide();

      // Toast notification
      setToastMsg("✅ Leave Request Submitted Successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Re-fetch leaves list from database
      fetchLeaves();
    } catch (err) {
      console.error("Error submitting leave request:", err);
      const errMsg = err.response?.data?.message || err.message || "Try again.";
      setToastMsg(`❌ Failed to submit leave request: ${errMsg}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
    const map = { Pending: "warning", Approved: "success", Rejected: "danger" };
    return <span className={`badge bg-${map[normalized] || "secondary"} leave-badge`}>{normalized}</span>;
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white fw-bold m-0">Employee Panel</h3>
          <div className="nav-buttons d-flex gap-2 flex-wrap">
            <button className="btn nav-btn" onClick={() => navigate("/employee")}>Dashboard</button>
            <button className="btn nav-btn" onClick={() => navigate("/mytasks")}>My Tasks</button>
            <button
              className="btn btn-success"
              onClick={() => navigate("/attendance")}
            >
              📍 Mark Attendance
            </button>
            <button
              className="btn btn-primary active fw-semibold"
              onClick={() => navigate("/leave")}
              style={{ background: "#4f46e5", border: "none" }}
            >
              🌴 Leave
            </button>
            <button className="btn btn-danger" onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Welcome Banner */}
        <div className="welcome-banner mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Leave Management 🌴</h2>
            <p className="mb-0 opacity-75">Apply for leaves and track your requests.</p>
          </div>
          <button
            className="btn btn-light fw-semibold px-4 py-2 shadow-sm"
            data-bs-toggle="modal"
            data-bs-target="#applyLeaveModal"
            style={{ borderRadius: "12px", color: "#2563eb" }}
          >
            <FaUmbrellaBeach className="me-2" />
            Apply Leave
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your leave history...</p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="row g-3 mb-4">
              {[
                { label: "Total Applied", value: leaves.length, icon: <FaCalendarAlt size={28} />, cls: "employee-card" },
                { label: "Pending", value: leaves.filter(l => l.status === "Pending" || l.status === "pending").length, icon: <FaClock size={28} />, cls: "pending-card" },
                { label: "Approved", value: leaves.filter(l => l.status === "Approved" || l.status === "approved").length, icon: <FaCheckCircle size={28} />, cls: "completed-card" },
                { label: "Rejected", value: leaves.filter(l => l.status === "Rejected" || l.status === "rejected").length, icon: <FaTasks size={28} />, cls: "task-card" },
              ].map((s, i) => (
                <div className="col-6 col-md-3" key={i}>
                  <div className={`dashboard-card ${s.cls} p-3`} style={{ minHeight: "120px" }}>
                    {s.icon}
                    <div className="fw-semibold mt-1" style={{ fontSize: "13px" }}>{s.label}</div>
                    <div style={{ fontSize: "32px", fontWeight: 700 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave History Table */}
            <div className="leave-card">
              <div className="leave-card-header">
                <h5 className="mb-0 fw-bold">My Leave Requests</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="leave-table-head">
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-4 text-muted">No leave requests yet.</td></tr>
                    ) : leaves.map((l) => (
                      <tr key={l.id}>
                        <td><span className="leave-type-pill">{l.leave_type}</span></td>
                        <td>{formatDate(l.start_date)}</td>
                        <td>{formatDate(l.end_date)}</td>
                        <td className="text-muted" style={{ maxWidth: "180px" }}>
                          <span title={l.reason}>{l.reason.length > 30 ? l.reason.slice(0, 30) + "…" : l.reason}</span>
                        </td>
                        <td>{statusBadge(l.status)}</td>
                        <td className="text-muted">{formatDate(l.applied_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Apply Leave Modal ── */}
      <div className="modal fade" id="applyLeaveModal" tabIndex="-1" aria-labelledby="applyLeaveModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content leave-modal">
            <div className="modal-header leave-modal-header">
              <div>
                <h5 className="modal-title fw-bold mb-0" id="applyLeaveModalLabel">Apply for Leave</h5>
                <small className="opacity-75">Fill out the form below to submit your leave request</small>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body p-4">
                <div className="row g-3">

                  {/* Leave Type */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Leave Type <span className="text-danger">*</span></label>
                    <select
                      className={`form-select leave-input ${errors.type ? "is-invalid" : ""}`}
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="">Select leave type...</option>
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Earned Leave</option>
                      <option>Work From Home</option>
                      <option>Emergency Leave</option>
                    </select>
                    {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                  </div>

                  {/* Start Date */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Start Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className={`form-control leave-input ${errors.startDate ? "is-invalid" : ""}`}
                      value={form.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                    {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                  </div>

                  {/* End Date */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">End Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className={`form-control leave-input ${errors.endDate ? "is-invalid" : ""}`}
                      value={form.endDate}
                      min={form.startDate || new Date().toISOString().split("T")[0]}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                    {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                  </div>

                  {/* Reason */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Reason <span className="text-danger">*</span></label>
                    <textarea
                      rows={4}
                      placeholder="Describe the reason for your leave (minimum 10 characters)..."
                      className={`form-control leave-input ${errors.reason ? "is-invalid" : ""}`}
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                    />
                    <div className="d-flex justify-content-between">
                      {errors.reason
                        ? <div className="invalid-feedback d-block">{errors.reason}</div>
                        : <small className="text-muted mt-1">Min 10 characters</small>}
                      <small className="text-muted mt-1">{form.reason.length} chars</small>
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Attachment <span className="text-muted">(Optional)</span></label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="form-control leave-input"
                      onChange={e => setForm({ ...form, attachment: e.target.files[0] })}
                    />
                    <small className="text-muted">Accepted: PDF, JPG, PNG</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer leave-modal-footer">
                <button type="button" className="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn leave-submit-btn px-5" disabled={submitting}>
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                    : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div className={`toast leave-toast align-items-center ${showToast ? "show" : ""}`} role="alert">
          <div className="d-flex">
            <div className="toast-body fw-semibold">{toastMsg}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLeave;
