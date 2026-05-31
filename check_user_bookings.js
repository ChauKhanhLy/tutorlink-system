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
    const res = await pool.query(`SELECT id, name FROM users WHERE name LIKE '%Ngọc%'`);
    console.log("Users found:", JSON.stringify(res.rows, null, 2));
    if (res.rows.length > 0) {
        const userId = res.rows[0].id;
        const bRes = await pool.query(`SELECT id, status, datetime FROM bookings WHERE learner_id = $1`, [userId]);
        console.log("Bookings for this user:", JSON.stringify(bRes.rows, null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
