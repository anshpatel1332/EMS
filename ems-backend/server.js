require("dotenv").config();
console.log("THIS IS MY SERVER FILE");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeesRoutes");
const taskRoutes = require("./routes/taskRoutes");
const locationRoutes = require("./routes/locationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const faceRoutes = require("./routes/faceRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "https://ems-gray-three.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/tasks", taskRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/face", faceRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});