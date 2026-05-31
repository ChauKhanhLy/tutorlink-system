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
    const userId = "fc3a4f1c-dd39-4d57-a7b2-6e98ccc80add";
    const bRes = await pool.query(`SELECT id, status, datetime FROM bookings WHERE learner_id = $1`, [userId]);
    console.log("Bookings for user fc3a...:", JSON.stringify(bRes.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
