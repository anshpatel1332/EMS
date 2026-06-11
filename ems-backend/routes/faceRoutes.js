const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");


// =======================
// REGISTER FACE
// =======================
router.post("/", async (req, res) => {
  try {
    const { employee_id, face_encoding, image_url } = req.body;

    if (!employee_id || !image_url) {
      return res.status(400).json({ error: "Missing data" });
    }

    await pool.query(
      `INSERT INTO face_data (employee_id, face_encoding, image_url)
       VALUES ($1, $2, $3)`,
      [employee_id, face_encoding, image_url]
    );

    res.json({ message: "Face saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =======================
// VERIFY ATTENDANCE
// =======================
router.post("/verify", async (req, res) => {
  try {
    const { image, latitude, longitude, employee_id } = req.body;
    console.log(`[verify] Request received — employee_id: ${employee_id}, lat: ${latitude}, lng: ${longitude}`);

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    if (!employee_id) {
      return res.status(400).json({ message: "❌ Employee ID missing. Please login again." });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "❌ Location permission denied. Please allow location access." });
    }

    // 1. GET ONLY THIS EMPLOYEE'S REGISTERED FACE — exclude broken placeholder URLs
    const facesResult = await pool.query(`
      SELECT employee_id, image_url
      FROM face_data
      WHERE employee_id = $1
        AND image_url IS NOT NULL
        AND image_url NOT LIKE '%placeholder.com%'
      LIMIT 1
    `, [employee_id]);

    if (facesResult.rows.length === 0) {
      return res.json({ message: "❌ Face not registered. Please register your face first." });
    }

    const known_faces = facesResult.rows;

    // 2. CALL PYTHON
    const response = await axios.post("https://ems-2-n7ck.onrender.com/verify", {
      image,
      known_faces
    });

    const result = response.data;
    console.log(`[verify] Python result:`, JSON.stringify(result));

    if (!result.match) {
      console.log(`[verify] Face did NOT match — returning: ${result.message}`);
      return res.json({ message: result.message });
    }

    console.log(`[verify] Face matched ✅ — proceeding to GPS check`);

    // employee_id already known from req.body (the logged-in user)

    // 3. GET OFFICE LOCATION FROM DB
    const officeResult = await pool.query(
      "SELECT latitude, longitude, radius FROM office_location LIMIT 1"
    );

    if (!officeResult.rows.length) {
      console.log(`[verify] No office location configured!`);
      return res.status(500).json({ message: "❌ Office location not configured. Please set it in Location Settings." });
    }

    const { latitude: OFFICE_LAT, longitude: OFFICE_LNG, radius: OFFICE_RADIUS } = officeResult.rows[0];
    const radiusKm = (parseFloat(OFFICE_RADIUS) || 200) / 1000; // convert meters → km

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    const distance = getDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(OFFICE_LAT),
      parseFloat(OFFICE_LNG)
    );

    console.log(`[verify] GPS — user:(${latitude},${longitude}) office:(${OFFICE_LAT},${OFFICE_LNG}) dist:${(distance * 1000).toFixed(0)}m limit:${OFFICE_RADIUS}m`);

    if (distance > radiusKm) {
      console.log(`[verify] GPS FAILED — too far`);
      return res.json({ message: `❌ Outside office range (${(distance * 1000).toFixed(0)}m away, limit: ${OFFICE_RADIUS}m)` });
    }

    console.log(`[verify] GPS passed ✅ — inserting attendance`);

    // 4. MARK ATTENDANCE
    const att = await pool.query(
      `INSERT INTO attendance (employee_id, date, time, status)
       VALUES ($1, CURRENT_DATE, CURRENT_TIME, 'Present')
       RETURNING *`,
      [employee_id]
    );

    console.log(`[verify] Attendance inserted:`, att.rows[0]);

    res.json({
      message: "✅ Attendance Marked",
      data: att.rows[0]
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);

    res.status(500).json({
      error: err.message,
      hint: "Check Python server running on port 5001"
    });
  }
});

module.exports = router;