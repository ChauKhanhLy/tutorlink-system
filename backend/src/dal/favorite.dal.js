import db from '../config/db.js';

let isTableReady = false;

const ensureTable = async () => {
    if (isTableReady) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS favorite_tutors (
            id SERIAL PRIMARY KEY,
            student_id UUID NOT NULL,
            tutor_id UUID NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE (student_id, tutor_id)
        )
    `);

    isTableReady = true;
};
export const addFavorite = async (studentId, tutorId) => {
    await ensureTable();
    const query = `
        INSERT INTO favorite_tutors (student_id, tutor_id)
        VALUES ($1, $2)
        ON CONFLICT (student_id, tutor_id) DO NOTHING
        RETURNING *
    `;
    const result = await db.query(query, [studentId, tutorId]);
    return result.rows[0];
}

export const removeFavorite = async (studentId, tutorId) => {
    await ensureTable();
    const query = `
        DELETE FROM favorite_tutors
        WHERE student_id = $1 AND tutor_id = $2
        RETURNING *
    `;
    const result = await db.query(query, [studentId, tutorId]);
    return result.rows[0];
}

export const getFavoritesByStudent = async (studentId) => {
    await ensureTable();
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.avatar, 
            COALESCE(tp.bio, '') as bio,
            COALESCE(tp.hourly_fee, 0) as hourly_fee, 
            COALESCE(tp.experience, '') as experience,
            COALESCE(tp.languages, '[]') as languages,
            COALESCE(ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') AS subjects,
            COALESCE(AVG(r.rating), 0) AS rating
        FROM favorite_tutors ft
        JOIN users u ON ft.tutor_id = u.id
        LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
        LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_id
        LEFT JOIN subjects s ON ts.subject_id = s.id
        LEFT JOIN bookings b ON u.id = b.tutor_id
        LEFT JOIN reviews r ON b.id = r.booking_id
        WHERE ft.student_id = $1
        GROUP BY ft.created_at, u.id, u.name, u.avatar, tp.bio, tp.hourly_fee, tp.experience, tp.languages
        ORDER BY ft.created_at DESC
    `;
    const result = await db.query(query, [studentId]);
    return result.rows;
}