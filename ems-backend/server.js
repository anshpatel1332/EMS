require("dotenv").config();
console.log("THIS IS MY SERVER FILE");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeesRoutes");
const taskRoutes = require("./routes/taskRoutes");
const locationRoutes = require("./routes/locationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const faceRoutes = require("./routes/faceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin === "https://ems-gray-three.vercel.app" ||
        origin.startsWith("http://localhost:") ||
        origin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser()); // Parse cookies on every request


app.get("/", (req, res) => {
  res.json({ status: "ok", service: "EMS Node.js Backend" });
});

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/tasks", taskRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/leaves", leaveRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
