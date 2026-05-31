import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend", ".env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function check() {
  try {
    const res = await pool.query(`SELECT * FROM bookings LIMIT 1`);
    console.log("Column names:", Object.keys(res.rows[0]));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
