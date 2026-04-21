import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false
});

async function checkData() {
  try {
    await client.connect();
    console.log("--- Recent Bookings ---");
    const bookings = await client.query('SELECT id, status, learner_id, tutor_id FROM bookings ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(bookings.rows, null, 2));

    console.log("\n--- Video Sessions ---");
    const sessions = await client.query('SELECT * FROM video_sessions LIMIT 5');
    console.log(JSON.stringify(sessions.rows, null, 2));
    
    // Check if any confirmed booking lacks a video session
    const orphaned = await client.query(`
      SELECT b.id as booking_id, b.status 
      FROM bookings b 
      LEFT JOIN video_sessions vs ON b.id = vs.booking_id 
      WHERE b.status = 'confirmed' AND vs.id IS NULL
    `);
    console.log("\n--- Confirmed Bookings without Video Sessions ---");
    console.log(JSON.stringify(orphaned.rows, null, 2));

    console.log("\n--- Recent Messages ---");
    const messages = await client.query('SELECT * FROM messages ORDER BY sent_at DESC LIMIT 5');
    console.log(JSON.stringify(messages.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkData();
