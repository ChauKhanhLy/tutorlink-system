import 'dotenv/config';
import db from './src/config/db.js';

const run = async () => {
    try {
        const result = await db.query(`SELECT u.id, u.name, u.role, u.verified FROM users u WHERE u.role = 'tutor'`);
        console.log("USERS:", result.rows);
        
        const q2 = `
    SELECT 
      u.id,
      u.name,
      u.verified as u_ver,
      tp.verified as tp_ver
    FROM users u
    LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
    LEFT JOIN tutor_subjects ts ON u.id = ts.tutor_id
    LEFT JOIN subjects s ON ts.subject_id = s.id
    WHERE u.role = 'tutor' AND u.verified = true
    `;
        const res2 = await db.query(q2);
        console.log("MATCHING:", res2.rows);
        
        process.exit(0);
    } catch(e) {
        console.error(e);
    }
}
run();
