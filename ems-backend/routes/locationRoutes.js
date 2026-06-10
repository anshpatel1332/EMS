console.log("LOCATION ROUTES LOADED");
const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM office_location LIMIT 1"
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.put("/", async (req, res) => {
  try {
    const {
      office_name,
      latitude,
      longitude,
      radius
    } = req.body;

    await pool.query(
      `UPDATE office_location
       SET office_name=$1,
           latitude=$2,
           longitude=$3,
           radius=$4
       WHERE id=1`,
      [office_name, latitude, longitude, radius]
    );

    res.json({
      success: true,
      message: "Location Updated"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});
module.exports = router;