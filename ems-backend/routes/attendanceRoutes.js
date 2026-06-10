const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ GET ALL ATTENDANCE (FINAL FIX)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.employee_id,
        COALESCE(e.name, 'Unknown') AS employee,
        a.date,
        a.time,
        a.status
      FROM attendance a
      LEFT JOIN employees e 
        ON a.employee_id = e.id
      ORDER BY a.date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Attendance Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;