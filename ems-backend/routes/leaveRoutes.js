const express = require("express");
const router = express.Router();
const pool = require("../db");

/* =============================================
   ADMIN ROUTES
   ============================================= */

/* ---------- GET ALL LEAVE REQUESTS (Admin) ---------- */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        leaves.id,
        leaves.employee_id,
        leaves.leave_type,
        leaves.start_date,
        leaves.end_date,
        leaves.reason,
        leaves.attachment_url,
        leaves.status,
        leaves.applied_at,
        employees.name AS employee_name
      FROM leaves
      JOIN employees ON leaves.employee_id = employees.id
      ORDER BY leaves.applied_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------- APPROVE LEAVE (Admin) ---------- */
router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE leaves
       SET status = 'Approved'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave approved", leave: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------- REJECT LEAVE (Admin) ---------- */
router.put("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE leaves
       SET status = 'Rejected'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json({ message: "Leave rejected", leave: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------- LEAVE STATS (Admin) ---------- */
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM leaves");
    const pending = await pool.query(
      "SELECT COUNT(*) FROM leaves WHERE status = 'Pending'"
    );
    const approved = await pool.query(
      "SELECT COUNT(*) FROM leaves WHERE status = 'Approved'"
    );
    const rejected = await pool.query(
      "SELECT COUNT(*) FROM leaves WHERE status = 'Rejected'"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      approved: parseInt(approved.rows[0].count),
      rejected: parseInt(rejected.rows[0].count),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* =============================================
   EMPLOYEE ROUTES
   ============================================= */

/* ---------- APPLY FOR LEAVE (Employee) ---------- */
router.post("/", async (req, res) => {
  try {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      attachment_url,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO leaves
       (employee_id, leave_type, start_date, end_date, reason, attachment_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING *`,
      [employee_id, leave_type, start_date, end_date, reason, attachment_url || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------- GET MY LEAVES (Employee) ---------- */
router.get("/my/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    const result = await pool.query(
      `SELECT * FROM leaves
       WHERE employee_id = $1
       ORDER BY applied_at DESC`,
      [employeeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
