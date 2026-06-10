import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://ems-v0c2.onrender.com",
});