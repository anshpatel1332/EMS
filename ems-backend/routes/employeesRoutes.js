const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/count", async (req, res) => {
  try { 
    const result = await pool.query("select count(*) from employees");

  res.json({
    employees: result.rows[0].count
  });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "select id ,name,email,department, role from employees order by id asc "
    )
  res.json(result.rows);
}
catch(err){
res.status(500).json({message: "server error"})
}
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    const result = await pool.query(
      "INSERT INTO employees (name, email, password, department, role) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email, password, department, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM employees");

    const admins = await pool.query(
      "SELECT COUNT(*) FROM employees WHERE role = 'admin'"
    );

    const active = await pool.query(
      "SELECT COUNT(*) FROM employees WHERE role = 'employee'"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      admins: parseInt(admins.rows[0].count),
      active: parseInt(active.rows[0].count)
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM employees WHERE id=$1", [id]);

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, role } = req.body;

    const result = await pool.query(
      `UPDATE employees 
       SET name=$1, email=$2, department=$3, role=$4 
       WHERE id=$5 
       RETURNING *`,
      [name, email, department, role, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router; 