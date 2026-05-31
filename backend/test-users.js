import sequelize from './src/config/database.js';

async function test() {
  try {
    const [results] = await sequelize.query('SELECT id, name, role FROM users');
    console.log('Users:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}
test();
