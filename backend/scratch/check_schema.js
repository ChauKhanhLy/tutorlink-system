import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const r = await pool.query(
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' ORDER BY ordinal_position`
);
console.log('bookings columns:', r.rows.map(x => `${x.column_name}(${x.data_type})`));

const r2 = await pool.query(`SELECT id, fee, type FROM bookings WHERE status='confirmed' LIMIT 3`);
console.log('sample bookings:', r2.rows);

await pool.end();
