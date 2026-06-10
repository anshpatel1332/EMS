import React, { useState, useEffect } from "react";
import API from "../Services/Api";
import "./Task.css";
import { useNavigate } from "react-router-dom";

function Task() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });

  const initialForm = {
    title: "",
    description: "",
    priority: "Low",
    employee_id: "",
    status: "Pending"
  };

  const [formData, setFormData] = useState(initialForm);

  /* ---------------- HANDLE INPUT ---------------- */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* ---------------- FETCH TASKS ---------------- */
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- FETCH EMPLOYEES ---------------- */
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- FETCH STATS ---------------- */
  const fetchStats = async () => {
    try {
      const total = await API.get("/tasks/count");
      const completed = await API.get("/tasks/completed-count");
      const pending = await API.get("/tasks/pending-count");

      setStats({
        total: total.data.tasks || 0,
        completed: completed.data.completed || 0,
        pending: pending.data.pending || 0
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchStats();
  }, []);

  /* ---------------- SUBMIT (CREATE / UPDATE) ---------------- */
  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.employee_id) {
        alert("Please fill required fields");
        return;
      }

      if (editingId) {
        await API.put(`/tasks/${editingId}`, formData);
      } else {
        await API.post("/tasks", formData);
      }

      resetForm();
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- RESET FORM ---------------- */
  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      employee_id: task.employee_id,
      status: task.status
    });

    setEditingId(task.id);
    setShowForm(true);
  };

  return (
    <div className="task-page">

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg admin-navbar px-4">
        <div className="container-fluid">
          <h3 className="text-white m-0">Tasks</h3>

          <button
            className="btn nav-btn"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="task-container">

        <div className="welcome-banner">
          <h2>Admin Task Management 👋</h2>
          <p>Assign, update and track employee tasks</p>
        </div>

        {/* TASK TABLE */}
        <div className="task-list-card">
          <h3>Task List</h3>

          <table className="task-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Employee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.employee_name}</td>
                  <td>{task.priority}</td>
                  <td>{task.status}</td>
                  <td>
                    <button
                      className="btn btn-primary me-2"
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOGGLE BUTTON */}
        <button
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "+ Add Task"}
        </button>

        {/* FORM */}
        {showForm && (
          <div className="task-form">

            <h3>{editingId ? "Edit Task" : "Add Task"}</h3>

            <input
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Task Description"
              value={formData.description}
              onChange={handleChange}
            />

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>Completed</option>
            </select>

            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-success"
              onClick={handleSubmit}
            >
              {editingId ? "Update Task" : "Create Task"}
            </button>

          </div>
        )}

        {/* STATS */}
        <div className="row g-4 mt-4">

          <div className="col-md-4">
            <div className="info-card total-card">
              <h5>Total</h5>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card completed-card">
              <h5>Completed</h5>
              <h2>{stats.completed}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="info-card pending-card" >
              <h5>Pending</h5>
              <h2>{stats.pending}</h2>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Task;