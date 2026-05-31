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
  `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'video_sessions' ORDER BY ordinal_position`
);
console.log('video_sessions columns:', r.rows.map(x => `${x.column_name}(${x.data_type})`));

const r2 = await pool.query(`SELECT id, room_id, record_url, status FROM video_sessions LIMIT 5`);
console.log('sample video_sessions:', r2.rows);

await pool.end();
