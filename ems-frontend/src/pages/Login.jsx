import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import API from "../Services/Api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", { email, password });
      const user = response.data;

      if (!user || !user.id) {
        alert("Invalid login response from server");
        return;
      }

      // Store basic user info in localStorage for quick UI reads.
      // The real auth token lives in the httpOnly cookie.
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Login failed. Please try again.";
      alert(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Employee Management System</h1>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;