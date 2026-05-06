import 'dotenv/config';
import db from '../src/config/db.js';

async function migrate() {
    try {
        console.log('Checking bookings table for type column...');
        const checkColumn = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'type'
        `);

        if (checkColumn.rows.length === 0) {
            console.log('Adding type column to bookings table...');
            await db.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_type') THEN
                        CREATE TYPE booking_type AS ENUM ('trial', 'regular');
                    END IF;
                END $$;
                ALTER TABLE bookings ADD COLUMN type booking_type DEFAULT 'regular';
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Type column already exists.');
        }
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
