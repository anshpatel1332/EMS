import React, { useState } from "react";
import "./Task.css";
import { useNavigate } from "react-router-dom";

function Task() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="task-page">
      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">

          <h3 className="text-white fw-bold m-0">
            Tasks
          </h3>

          <div className="nav-buttons d-flex gap-2">

            <button className="btn nav-btn" onClick={() => navigate("/admin")}>
              Dashboard
            </button>

          </div>
        </div>
      </nav>

      <div className="task-container">
        <div className="welcome-banner">
          <h2>Welcome Back, Admin 👋</h2>
          <p>Manage and assign employee tasks.</p>
        </div>

        <div className="task-list-card">

          <h3>Task List</h3>

          <table className="task-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task Name</th>
                <th>Assigned To</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>
                <td>Website Design</td>
                <td>Ansh Patel</td>
                <td>15 June</td>
                <td>
                  <span className="badge bg-warning">
                    Pending
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary me-2">
                    Edit
                  </button>

                  <button className="btn btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {showForm && (
          <div className="task-form">
            <h3>Add Task</h3>

            <input
              type="text"
              placeholder="Task Title"
            />

            <textarea
              placeholder="Task Description"
              rows="3"
            ></textarea>

            <label>Priority</label>
            <select>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <label>Assign Employee</label>
            <select>
              <option>John</option>
              <option>Alex</option>
              <option>David</option>
            </select>

            <button className="btn btn-success">
              Create Task
            </button>
          </div>
        )}

        <button
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "Add Task"}
        </button>

        <div className="row g-4 mt-3">

          <div className="col-md-4">
            <div className="info-card total-card">
              <h5>Total Tasks</h5>
              <h2>50</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card completed-card">
              <h5>Completed</h5>
              <h2>35</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card pending-card">
              <h5>Pending</h5>
              <h2>15</h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Task;