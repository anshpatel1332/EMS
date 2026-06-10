import React, { useState, useEffect } from "react";
import API from "../Services/Api";
import { useNavigate } from 'react-router-dom'
import "./MyTasks.css"
function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
  const stored = localStorage.getItem("user");

  if (!stored) return;

  const user = JSON.parse(stored);

  fetchTasks(user.id);

}, []);

const fetchTasks = async (employeeId) => {
  try {
    const res = await API.get(
      `/tasks/employee/${employeeId}`
    );

    setTasks(res.data);

  } catch (error) {
    console.log(error);
  }
};
const totalTasks = tasks.length;

const completedTasks = tasks.filter(
  task => task.status === "Completed"
).length;

const pendingTasks = tasks.filter(
  task => task.status !== "Completed"
).length;

 const updateStatus = async (taskId, newStatus) => {
  try {
    await API.put(`/tasks/status/${taskId}`, {
      status: newStatus
    });

    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );

  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="mytasks-page">
      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white fw-bold m-0">
            MyTasks
          </h3>
          <div className="nav-buttons d-flex gap-2">
            <button
              className="btn nav-btn"
              onClick={() => navigate("/employee")}
            >
              Dashboard
            </button>

          </div>
        </div>
      </nav>

      <div className="mytasks-container">

        <div className="welcome-banner">
          <h2>Welcome Back, Employee👋</h2>
          <p>Manage Tasks and organization records.</p>
        </div>
        <div className="table-wrapper">
          <table className="mytasks-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status ${task.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td> {task.status === "Pending" && (
                    <button className="btn btn-primary me-2" onClick={() => updateStatus(task.id, "In Progress")}>
                     Start Task
                    </button>
                  )}
                    {task.status === "In Progress" && (
                      <button className="btn btn-primary me-2" onClick={() => updateStatus(task.id, "Completed")
      }>
                        complete
                      </button>
                    )}
                    {task.status === "Completed" && (
                      <span className="text-success fw-bold">
                        Completed ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row g-4 mt-4">

          <div className="col-md-4">
            <div className="info-card total-card">
              <h5>Total Tasks</h5>
             <h2>{totalTasks}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card completed-card">
              <h5>Completed</h5>
        <h2>{completedTasks}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card pending-card">
              <h5>Pending</h5>
              <h2>{pendingTasks}</h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MyTasks;