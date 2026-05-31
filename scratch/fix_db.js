import db from './backend/src/models/index.js';

async function fixForeignKey() {
  try {
    console.log('Attempting to fix foreign key constraint...');
    
    // Drop existing constraint if it exists
    await db.sequelize.query(`
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_tutor_id_fkey;
    `);
    
    // Add new constraint pointing to users(id)
    await db.sequelize.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT bookings_tutor_id_fkey 
      FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE;
    `);
    
    console.log('Foreign key constraint fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing foreign key:', error);
    process.exit(1);
  }
}

fixForeignKey();
