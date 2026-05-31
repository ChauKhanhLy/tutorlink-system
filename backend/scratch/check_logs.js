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

const res = await pool.query(`
  SELECT 
    al.id as log_id,
    al.lesson_session_id,
    al.user_id,
    al.joined_at,
    al.left_at,
    ROUND(EXTRACT(EPOCH FROM (COALESCE(al.left_at, NOW()) - al.joined_at)) / 3600.0, 2) as hours,
    ls.booking_id,
    b.tutor_id,
    b.learner_id,
    b.fee,
    ls.duration_hours as session_duration
  FROM attendance_logs al
  JOIN lesson_sessions ls ON al.lesson_session_id = ls.id
  JOIN bookings b ON ls.booking_id = b.id
  LIMIT 10
`);
console.log(JSON.stringify(res.rows, null, 2));
await pool.end();
