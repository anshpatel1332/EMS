const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// ─── Cookie options ───────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,                          // JS cannot read the cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days in ms
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM employees WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const user = result.rows[0];

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token as httpOnly cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    // Return user info (no token in body – it's in the cookie)
    res.status(200).json({
      success: true,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
// Verify the cookie and return the current user (used to restore session)
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

module.exports = router;