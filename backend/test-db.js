import sequelize from './src/config/database.js';
import Booking from './src/models/booking.model.js';

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const bookings = await Booking.findAll();
    console.log('All Bookings:', JSON.stringify(bookings, null, 2));
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    process.exit();
  }
}

test();
