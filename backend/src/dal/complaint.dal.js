import db from '../config/db.js';

const ensureComplaintTable = async () => {
  await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await db.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reported_id UUID REFERENCES users(id) ON DELETE SET NULL,
      booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
      type VARCHAR(50) DEFAULT 'other',
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      evidence TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      resolution_note TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
};

export const createComplaint = async (data) => {
  await ensureComplaintTable();
  const { reporter_id, reported_id, booking_id, type, title, description, evidence } = data;
  const result = await db.query(
    `INSERT INTO complaints (reporter_id, reported_id, booking_id, type, title, description, evidence)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [reporter_id, reported_id, booking_id, type, title, description, evidence]
  );
  return result.rows[0];
};

export const getComplaintById = async (id) => {
  await ensureComplaintTable();
  const result = await db.query(`SELECT * FROM complaints WHERE id = $1`, [id]);
  return result.rows[0];
};

export const getComplaintsByReporter = async (reporter_id) => {
  await ensureComplaintTable();
  const result = await db.query(
    `SELECT c.*, 
            u1.name as reporter_name, u2.name as reported_name
     FROM complaints c
     LEFT JOIN users u1 ON c.reporter_id = u1.id
     LEFT JOIN users u2 ON c.reported_id = u2.id
     WHERE c.reporter_id = $1
     ORDER BY c.created_at DESC`,
    [reporter_id]
  );
  return result.rows;
};

export const getAllComplaints = async (filters = {}) => {
  await ensureComplaintTable();
  let query = `
    SELECT c.*, 
           u1.name as reporter_name, u2.name as reported_name
    FROM complaints c
    LEFT JOIN users u1 ON c.reporter_id = u1.id
    LEFT JOIN users u2 ON c.reported_id = u2.id
    WHERE 1=1
  `;
  const values = [];
  if (filters.status) {
    values.push(filters.status);
    query += ` AND c.status = $${values.length}`;
  }
  query += ` ORDER BY c.created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

export const updateComplaintStatus = async (id, status, resolution_note) => {
  await ensureComplaintTable();
  const result = await db.query(
    `UPDATE complaints SET status = $1, resolution_note = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, resolution_note, id]
  );
  return result.rows[0];
};
