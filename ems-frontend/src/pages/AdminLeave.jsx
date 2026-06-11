import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import API from "../Services/Api";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaInfoCircle
} from "react-icons/fa";
import "./AdminDashboard.css";
import "./AdminLeave.css";

function AdminLeave() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // State for confirm action modal
  const [confirmAction, setConfirmAction] = useState({
    request: null,
    action: "",
  });

  // Fetch all leave requests & stats from API
  const fetchData = async () => {
    try {
      const [reqRes, statsRes] = await Promise.all([
        API.get("/api/leaves"),
        API.get("/api/leaves/stats"),
      ]);
      setRequests(reqRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.log("Error fetching leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionClick = (req, action) => {
    setConfirmAction({ request: req, action });
  };

  const executeAction = async () => {
    const { request, action } = confirmAction;
    if (!request) return;

    try {
      const endpoint =
        action === "Approve"
          ? `/api/leaves/${request.id}/approve`
          : `/api/leaves/${request.id}/reject`;

      await API.put(endpoint);

      // Re-fetch data so stats + table are both up-to-date
      await fetchData();

      // Close Modal
      const modalElement = document.getElementById("confirmActionModal");
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal?.hide();

      // Toast
      setToastType(action === "Approve" ? "success" : "danger");
      setToastMsg(
        action === "Approve"
          ? `✅ Leave request approved for ${request.employee_name}`
          : `❌ Leave request rejected for ${request.employee_name}`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.log("Error updating leave:", err);
      setToastType("danger");
      const errMsg = err.response?.data?.message || err.message || "Please try again.";
      setToastMsg(`❌ Failed to update leave request: ${errMsg}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }

    // Delay clearing confirmAction state to allow the modal transition to complete cleanly
    setTimeout(() => {
      setConfirmAction({ request: null, action: "" });
    }, 300);
  };

  const statusBadge = (status) => {
    const normalized = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    const map = { Pending: "warning text-dark", Approved: "success", Rejected: "danger" };
    return (
      <span className={`badge bg-${map[normalized] || "secondary"} leave-badge`}>
        {normalized}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <nav className="navbar navbar-expand-lg admin-navbar px-4">
          <div className="container-fluid">
            <h3 className="text-white fw-bold m-0">EMS Admin</h3>
          </div>
        </nav>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white fw-bold m-0">EMS Admin</h3>
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            <button className="btn nav-btn" onClick={() => navigate("/admin")}>
              Dashboard
            </button>
            <button className="btn nav-btn" onClick={() => navigate("/employees")}>
              Employees
            </button>
            <button className="btn nav-btn" onClick={() => navigate("/task")}>
              Tasks
            </button>
            <button
              className="btn btn-primary active fw-semibold"
              onClick={() => navigate("/admin/leave")}
              style={{ background: "#4f46e5", border: "none" }}
            >
              Leave Requests
            </button>
            <button className="btn btn-danger" onClick={() => navigate("/")}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Welcome / Header Banner */}
        <div className="welcome-banner mb-4">
          <h2 className="fw-bold mb-1">Leave Requests Dashboard 🌴</h2>
          <p className="mb-0 opacity-75">
            Review, approve, and reject employee leave requests.
          </p>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Requests", value: stats.total, icon: <FaCalendarAlt size={28} />, cls: "employee-card" },
            { label: "Pending", value: stats.pending, icon: <FaClock size={28} />, cls: "pending-card" },
            { label: "Approved", value: stats.approved, icon: <FaCheckCircle size={28} />, cls: "completed-card" },
            { label: "Rejected", value: stats.rejected, icon: <FaTimesCircle size={28} />, cls: "task-card" },
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

        {/* Requests Management Table */}
        <div className="leave-card">
          <div className="leave-card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Recent Requests</h5>
            <small className="opacity-75 d-none d-sm-inline-block">
              <FaInfoCircle className="me-1" />
              Approve or Reject pending leaves below.
            </small>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="leave-table-head">
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold text-dark">{r.employee_name}</td>
                      <td>
                        <span className="leave-type-pill">{r.leave_type}</span>
                      </td>
                      <td>{formatDate(r.start_date)}</td>
                      <td>{formatDate(r.end_date)}</td>
                      <td className="text-muted" style={{ maxWidth: "220px" }}>
                        <span title={r.reason}>
                          {r.reason?.length > 40 ? r.reason.slice(0, 40) + "…" : r.reason}
                        </span>
                      </td>
                      <td>{statusBadge(r.status)}</td>
                      <td>
                        {r.status?.toLowerCase() === "pending" ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success action-btn d-flex align-items-center gap-1"
                              data-bs-toggle="modal"
                              data-bs-target="#confirmActionModal"
                              onClick={() => handleActionClick(r, "Approve")}
                            >
                              <FaCheck size={10} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-danger action-btn d-flex align-items-center gap-1"
                              data-bs-toggle="modal"
                              data-bs-target="#confirmActionModal"
                              onClick={() => handleActionClick(r, "Reject")}
                            >
                              <FaTimes size={10} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      <div
        className="modal fade"
        id="confirmActionModal"
        tabIndex="-1"
        aria-labelledby="confirmActionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content leave-modal">
            <div
              className={`modal-header ${confirmAction.action === "Approve" ? "bg-success" : "bg-danger"
                } text-white`}
              style={{ borderBottom: "none" }}
            >
              <h5 className="modal-title fw-bold" id="confirmActionModalLabel">
                Confirm {confirmAction.action}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body p-4 text-center">
              <p className="fs-5 mb-2">
                Are you sure you want to <strong>{confirmAction.action?.toLowerCase()}</strong> this leave request?
              </p>
              {confirmAction.request && (
                <div className="card bg-light border-0 p-3 text-start mb-0">
                  <div className="mb-1">
                    <strong>Employee:</strong> {confirmAction.request.employee_name}
                  </div>
                  <div className="mb-1">
                    <strong>Type:</strong> {confirmAction.request.leave_type}
                  </div>
                  <div className="mb-1">
                    <strong>Duration:</strong> {formatDate(confirmAction.request.start_date)} to {formatDate(confirmAction.request.end_date)}
                  </div>
                  <div>
                    <strong>Reason:</strong> "{confirmAction.request.reason}"
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer leave-modal-footer">
              <button type="button" className="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${confirmAction.action === "Approve" ? "success" : "danger"
                  } px-4 fw-semibold`}
                onClick={executeAction}
              >
                Yes, {confirmAction.action}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div
          className={`toast align-items-center ${showToast ? "show" : ""} ${toastType === "success" ? "bg-success" : "bg-danger"
            } text-white`}
          role="alert"
          style={{ border: "none", borderRadius: "12px" }}
        >
          <div className="d-flex">
            <div className="toast-body fw-semibold">{toastMsg}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLeave;
