import React, { useState, useEffect } from "react";
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaCheckCircle, FaClock, FaUmbrellaBeach } from "react-icons/fa";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  const [employee, setEmployee] = useState(null);

  const fetchStats = async (id) => {
    try {
      const res = await API.get(`/tasks/stats/${id}`);

      setStats({
        total: res.data.total,
        completed: res.data.completed,
        pending: res.data.pending
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) return;

    const user = JSON.parse(stored);

    if (user?.id) {
      setEmployee(user);
      fetchStats(user.id);
    }
  }, []);

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">

      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white fw-bold m-0">Employee Panel</h3>
          <button className="navbar-toggler" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            arial-label="toggle-navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end">
            <div className=" d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
              <button className="btn nav-btn" onClick={() => navigate("/mytasks")}>
                My Tasks
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate("/attendance")}
              >
                📍 Mark Attendance
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/leave")}
                style={{ background: "#4f46e5", border: "none" }}
              >
                🌴 Leave
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          </div></div>
      </nav>

      <div className="container py-4">

        <div className="welcome-banner mb-4">
          <h2>Welcome Back, {employee.name} 👋</h2>
          <p>{employee.role} • {employee.department}</p>
        </div>

        <div className="employee-info-card mb-4">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Role:</strong> {employee.role}</p>
        </div>

        <div className="row g-4 mb-4">

          <div className="col-md-4">
            <div className="dashboard-card employee-card">
              <FaTasks size={45} />
              <h5>Assigned Tasks</h5>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="dashboard-card completed-card">
              <FaCheckCircle size={45} />
              <h5>Completed</h5>
              <h2>{stats.completed}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="dashboard-card pending-card">
              <FaClock size={45} />
              <h5>Pending</h5>
              <h2>{stats.pending}</h2>
            </div>
          </div>

        </div>

        {/* Quick Actions / Features */}
        <div className="row g-4 mt-2">
          <div className="col-md-6">
            <div className="dashboard-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)", minHeight: "180px", color: "white" }}>
              <h4 className="fw-bold mb-2">Attendance Management 📍</h4>
              <p className="small mb-3 opacity-90">Mark your daily attendance and check location settings.</p>
              <button className="btn custom-btn mt-auto align-self-start" onClick={() => navigate("/attendance")}>
                Mark Attendance
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="dashboard-card" style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", minHeight: "180px", color: "white" }}>
              <h4 className="fw-bold mb-2">Leave Management 🌴</h4>
              <p className="small mb-3 opacity-90">Apply for casual, sick, or earned leaves and check your request history.</p>
              <button className="btn custom-btn mt-auto align-self-start" onClick={() => navigate("/leave")}>
                Apply Leave / View History
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmployeeDashboard;