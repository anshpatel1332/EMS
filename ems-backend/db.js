const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

pool.connect()
  .then(() => {
    console.log("✅ Database Connected");
  })
  .catch((err) => {
    console.log("❌ Database Error:", err.message);
  });

module.exports = pool;