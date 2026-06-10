import React, { useEffect, useRef, useState } from "react";
import API from "../Services/Api";

function EmployeeAttendance() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Get logged-in employee id from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employee_id = user.id;

  // 🎥 START CAMERA
  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Camera not available");
    }
  };

  // 📸 FACE + GPS ATTENDANCE
  const markAttendance = async () => {
    try {
      setLoading(true);
      setStatus("");

      const video = videoRef.current;

      if (!video.videoWidth) {
        setStatus("❌ Camera not ready");
        setLoading(false);
        return;
      }

      // capture image
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg", 0.7);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          try {
            if (!employee_id) {
              setStatus("❌ Session expired. Please login again.");
              setLoading(false);
              return;
            }

            const res = await API.post("/api/face/verify", {
              image,
              latitude,
              longitude,
              employee_id
            });

            setStatus(res.data.message || "Done");
          } catch (err) {
            console.log(err.response?.data || err.message);
            setStatus("❌ Server error");
          }

          setLoading(false);
        },
        () => {
          setStatus("❌ Location denied");
          setLoading(false);
        }
      );

    } catch (err) {
      console.log(err);
      setStatus("❌ Attendance failed");
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">

      <div className="card shadow border-0" style={{ borderRadius: "20px" }}>
        <div className="card-body p-4">

          <h2 className="fw-bold mb-4">📍 Employee Attendance</h2>

          {/* CAMERA */}
          <div
            className="border rounded mb-3"
            style={{
              height: "350px",
              background: "#000",
              overflow: "hidden"
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>

          {/* BUTTON */}
          <button
            className="btn btn-success w-100 py-2"
            onClick={markAttendance}
            disabled={loading}
          >
            {loading ? "Processing..." : "📸 Mark Attendance"}
          </button>

          {/* STATUS */}
          {status && (
            <div className="mt-3 text-center">
              <h5>{status}</h5>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default EmployeeAttendance;