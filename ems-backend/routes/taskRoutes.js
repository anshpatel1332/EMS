const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ---------- GET ALL TASKS ---------- */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.priority,
        tasks.status,
        tasks.employee_id,
        employees.name AS employee_name
      FROM tasks
      JOIN employees
      ON tasks.employee_id = employees.id
      ORDER BY tasks.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- CREATE TASK ---------- */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      employee_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks
      (title, description, priority, status, employee_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        title,
        description,
        priority,
        "Pending",
        employee_id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});

router.put("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});


/* ---------- UPDATE FULL TASK ---------- */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      priority,
      employee_id,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET
       title = $1,
       description = $2,
       priority = $3,
       employee_id = $4,
       status = $5
       WHERE id = $6
       RETURNING *`,
      [
        title,
        description,
        priority,
        employee_id,
        status,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
});


/* ---------- TASK COUNT ---------- */
router.get("/count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM tasks"
    );

    res.json({
      tasks: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- COMPLETED COUNT ---------- */
router.get("/completed-count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE status = 'Completed'"
    );

    res.json({
      completed: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- PENDING COUNT ---------- */
router.get("/pending-count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE status = 'Pending'"
    );

    res.json({
      pending: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- GLOBAL STATS ---------- */
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query(
      "SELECT COUNT(*) FROM tasks"
    );

    const completed = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE status = 'Completed'"
    );

    const pending = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE status = 'Pending'"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      pending: parseInt(pending.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- EMPLOYEE TASKS ---------- */
router.get("/employee/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE employee_id = $1",
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* ---------- EMPLOYEE STATS ---------- */
router.get("/stats/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;

    const total = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE employee_id = $1",
      [employee_id]
    );

    const completed = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE employee_id = $1 AND status = 'Completed'",
      [employee_id]
    );

    const pending = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE employee_id = $1 AND status != 'Completed'",
      [employee_id]
    );

    res.json({
      total: parseInt(total.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      pending: parseInt(pending.rows[0].count)
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

module.exports = router;