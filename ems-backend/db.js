const { Pool } = require("pg");
require("dotenv").config();

const isLocal = process.env.DATABASE_URL?.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => {
    console.log("✅ Database Connected");
  })
  .catch((err) => {
    console.log("❌ Database Error:", err);
  });

module.exports = pool;