import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import Task from "./pages/Task";
import MyTasks from "./pages/MyTasks";
import LocationSettings from "./pages/LocationSettings";
import FaceRegistration from "./pages/FaceRegistration";
import AttendanceManagement from "./pages/AttendanceManagement";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeLeave from "./pages/EmployeeLeave";
import AdminLeave from "./pages/AdminLeave";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/task" element={<Task />} />
        <Route path="/mytasks" element={<MyTasks />} />
        <Route path="/attendance" element={<EmployeeAttendance />} />
        <Route path="/leave" element={<EmployeeLeave />} />
        <Route path="/admin/leave" element={<AdminLeave />} />
        <Route
          path="/admin/location-settings"
          element={<LocationSettings />}
        />
        <Route
          path="/admin/face-registration"
          element={<FaceRegistration />}
        />

        <Route
          path="/admin/attendance-management"
          element={<AttendanceManagement />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;