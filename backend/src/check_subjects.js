import 'dotenv/config';
import db from './config/db.js';

async function check() {
    try {
        const subjects = await db.query('SELECT * FROM subjects');
        console.log('Subjects:', JSON.stringify(subjects.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
