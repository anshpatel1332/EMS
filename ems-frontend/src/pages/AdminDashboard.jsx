import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import API from "../Services/Api";

import {
  FaUsers,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt
} from "react-icons/fa";
import './AdminDashboard.css'

function AdminDashboard() {

  const [stats, setStats] = useState({
    employees: 0,
    tasks: 0,
    completed: 0,
    pending: 0
  });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const fetchStats = async () => {
    try {
      const emp = await API.get("/employees/count");
      const task = await API.get("/tasks/count");
      const comp = await API.get("/tasks/completed-count");
      const pend = await API.get("/tasks/pending-count");

      setStats({
        employees: emp.data.employees,
        tasks: task.data.tasks,
        completed: comp.data.completed,
        pending: pend.data.pending
      });
    } catch (err) {
      console.log(err);
    }

  };

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const navigate = useNavigate();
  return (
    <div className="dashboard-container">

      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white fw-bold m-0">
            EMS Admin
          </h3>

          <div className="d-flex gap-2 flex-wrap justify-content-center">

            <button
              className="btn nav-btn"
              onClick={() => navigate("/employees")}
            >
              Employees
            </button>

            <button
              className="btn nav-btn"
              onClick={() => navigate("/task")}
            >
              Tasks
            </button>

            <button
              className="btn nav-btn"
              onClick={() => navigate("/admin/leave")}
            >
              Leave Requests
            </button>

            <button
              className="btn btn-danger"
              onClick={() => navigate("/")}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container py-4">

        {/* Welcome Banner */}
        <div className="welcome-banner mb-5">
          <div>
            <h2 className="fw-bold">
              Welcome Back, Ansh 👋
            </h2>

            <p className="mb-0">
              Manage employees, monitor tasks and track performance.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="fw-bold text-dark">
            Dashboard Overview
          </h2>

          <p className="text-muted">
            Quick insights into your organization.
          </p>
        </div>
        {/* Dashboard Cards */}
        <div className="row g-4 mb-5">

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card employee-card">
              <FaUsers size={45} />
              <h5 className="mt-3">Employees</h5>
              <h2>{stats.employees}</h2>

              <button
                className="btn custom-btn mt-3"
                onClick={() => navigate("/employees")}
              >
                View Employees
              </button>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card task-card">
              <FaTasks size={45} />
              <h5 className="mt-3">Tasks</h5>
              <h2>{stats.tasks}</h2>

              <button
                className="btn custom-btn mt-3"
                onClick={() => navigate("/task")}
              >
                View Tasks
              </button>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card completed-card">
              <FaCheckCircle size={45} />
              <h5 className="mt-3">Completed</h5>
              <h2>{stats.completed}</h2>

              <button className="btn custom-btn mt-3">
                View Completed
              </button>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-card pending-card">
              <FaClock size={45} />
              <h5 className="mt-3">Pending</h5>
              <h2>{stats.pending}</h2>

              <button className="btn custom-btn mt-3">
                View Pending
              </button>
            </div>
          </div>

        </div>

        {/* Attendance Section */}
        <div className="mb-4">
          <h2 className="fw-bold text-dark">
            Attendance Management
          </h2>

          <p className="text-muted">
            Configure attendance system settings.
          </p>
        </div>

        <div className="row g-4 mb-5">

          {/* Location Settings */}
          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card employee-card">
              <FaMapMarkerAlt size={45} />

              <h5 className="mt-3">
                Location Settings
              </h5>

              <p className="small">
                Configure office location and attendance radius.
              </p>

              <button
                className="btn custom-btn mt-2"
                onClick={() => navigate("/admin/location-settings")}
              >
                Open Settings
              </button>
            </div>
          </div>

          {/* Future Face Registration Card */}
          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card task-card">
              <h1>😀</h1>

              <h5 className="mt-3">
                Face Registration
              </h5>

              <p className="small">
                Register employee faces for attendance.
              </p>

              <button
                className="btn custom-btn mt-2"
               onClick={() => navigate("/admin/face-registration")}
              >
                Open Camera
              </button>
            </div>
          </div>

          {/* Future Attendance Records Card */}
          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card completed-card">
              <h1>📅</h1>

              <h5 className="mt-3">
                Attendance Records
              </h5>

              <p className="small">
                View employee attendance reports.
              </p>

              <button
                className="btn custom-btn mt-2"
                onClick={() => navigate("/admin/attendance-management")}
              >
                Open Records
              </button>
            </div>
          </div>

        </div>
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Task</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {
              tasks?.map((task) => (
                <tr key={task.id}>
                  <td> {task.employee_name}</td>
                  <td> {task.title}</td>
                  <td>
                    <span className={`badge ${task.status === "Completed"
                      ? "bg-success"
                      : task.status === "Pending"
                        ? "bg-warning text-dark"
                        : "bg-primary"
                      }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div >


  );
}

export default AdminDashboard;