import React, { useState, useEffect } from 'react';
import API from "../Services/Api";
import { useNavigate } from "react-router-dom";
import "./Employees.css"
function Employees() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "employee"
    });
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        active: 0
    });
    const [editingId, setEditingId] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await API.put(`/employees/${editingId}`, formData);
            } else {
                await API.post("/employees", formData);
            }

            fetchEmployees();
            setShowForm(false);
            setEditingId(null);

            setFormData({
                name: "",
                email: "",
                password: "",
                department: "",
                role: "employee"
            });

        } catch (err) {
            console.log(err);
        }
    };
    const handleDelete = async (id) => {
        try {
            await API.delete(`/employees/${id}`);
            fetchEmployees(); // refresh table
        } catch (err) {
            console.log(err);
        }
    };

    const handleEdit = (emp) => {
        setFormData(emp);
        setEditingId(emp.id);
        setShowForm(true);
    };


    useEffect(() => {
        fetchEmployees();
        fetchStats();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await API.get("/employees");
            setEmployees(res.data);
        }
        catch (err) {
            console.log(err);
        }
    };
    const fetchStats = async () => {
        try {
            const res = await API.get("/employees/stats");
            setStats(res.data);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div className="employee-page">
            <nav className="navbar navbar-expand-lg admin-navbar px-4">
                <div className="container-fluid">

                    <h3 className="text-white fw-bold m-0">
                        Employees Page
                    </h3>

                    <div className="nav-buttons d-flex gap-2">

                        <button className="btn nav-btn" onClick={() => navigate("/admin")}>
                            Dashboard
                        </button>

                    </div>
                </div>
            </nav>
            <div className="employee-container">

                <div className="welcome-banner">
                    <h2>Welcome Back, Admin 👋</h2>
                    <p>Manage employees and organization records.</p>
                </div>


                <div className="employee-list-card">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0">Employee List</h3>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover employee-table" >

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    employees?.map((emp) => (
                                        <tr key={emp.id}>
                                            <td>{emp.id}</td>
                                            <td>{emp.name}</td>
                                            <td>{emp.email}</td>
                                            <td>{emp.department}</td>
                                            <td>{emp.role}</td>

                                            <td>
                                                <button
                                                    className="btn btn-primary me-2"
                                                    onClick={() => handleEdit(emp)}
                                                >
                                                    Edit
                                                </button>

                                                <button className="btn btn-danger" onClick={() => handleDelete(emp.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>

                        </table>
                        <button
                            className="btn btn-primary add-btn"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? "Close Form" : "+ Add Employee"}
                        </button>
                    </div>

                </div>

                {/* Form */}

                {showForm && (
                    <div className="employee-form-card mt-4">

                        <h4>Add Employee</h4>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter Name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="department"
                            placeholder="Department"
                            className="form-control"
                            value={formData.department}
                            onChange={handleChange}
                        />

                        <select name="role" className="form-select" value={formData.role}
                            onChange={handleChange}>
                            <option value="employee">employee</option>
                            <option value="admin">admin</option>

                        </select>

                        <button className="btn btn-success" onClick={handleSubmit}>
                            Save Employee
                        </button>

                    </div>
                )}

                {/* Stats Cards */}

                <div className="row g-4 mt-3">

                    <div className="col-md-4">
                        <div className="info-card total-card">
                            <h5>Total Employees</h5>
                            <h2>{stats.total}</h2>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="info-card admin-card">
                            <h5>Admins</h5>
                            <h2>{stats.admins}</h2>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="info-card active-card">
                            <h5>Active Employees</h5>
                            <h2>{stats.active}</h2>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Employees;