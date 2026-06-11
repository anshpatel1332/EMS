import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ems-v0c2.onrender.com",
  withCredentials: true, // Send cookies (JWT) with every request
});

export default API;