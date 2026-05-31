import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to DB successfully!");

    // Query triggers using pg_trigger and pg_class
    const triggersRes = await client.query(`
      SELECT 
        trg.tgname AS trigger_name,
        tbl.relname AS table_name,
        p.proname AS function_name
      FROM pg_trigger trg
      JOIN pg_class tbl ON trg.tgrelid = tbl.oid
      JOIN pg_proc p ON trg.tgfoid = p.oid
      WHERE tbl.relname IN ('bookings', 'video_sessions')
    `);
    console.log("\n--- TRIGGERS FROM PG_TRIGGER ---");
    if (triggersRes.rows.length === 0) {
      console.log("No triggers found on bookings or video_sessions tables.");
    } else {
      triggersRes.rows.forEach(row => {
        console.log(`Trigger: ${row.trigger_name} on table: ${row.table_name} executes function: ${row.function_name}`);
      });
    }

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
