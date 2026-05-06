import sequelize from '../config/database.js';
import { up as createWalletTable } from '../migrations/create-wallet-table.js';
import { up as createTransactionTable } from '../migrations/create-transaction-table.js';
import { up as createSettlementTable } from '../migrations/create-settlement-table.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Bắt đầu chạy migrations...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');
    
    // Run migrations
    await createWalletTable();
    console.log('✅ Tạo bảng wallets thành công');
    
    await createTransactionTable();
    console.log('✅ Tạo bảng transactions thành công');
    
    await createSettlementTable();
    console.log('✅ Tạo bảng settlements thành công');
    
    console.log('🎉 Tất cả migrations đã chạy thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi chạy migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runMigrations();
