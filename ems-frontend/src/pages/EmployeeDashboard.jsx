import React, { useState, useEffect } from "react";
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaCheckCircle, FaClock } from "react-icons/fa";
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

          <div className="nav-buttons d-flex gap-2">
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
              className="btn btn-danger"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">

        <div className="welcome-banner mb-5">
          <h2>Welcome Back, {employee.name} 👋</h2>
          <p>{employee.role} • {employee.department}</p>
        </div>

        <div className="employee-info-card mb-5">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Role:</strong> {employee.role}</p>
        </div>

        <div className="row g-4">

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

      </div>
    </div>
  );
}

export default EmployeeDashboard;