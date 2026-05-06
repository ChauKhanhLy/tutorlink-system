import cron from 'node-cron';
import * as WalletService from '../services/wallet.service.js';

// Chạy vào Chủ nhật hàng tuần lúc 23:59
cron.schedule('59 23 * * 0', async () => {
    console.log('🔄 Bắt đầu xử lý settlements hàng tuần...');
    
    try {
        const result = await WalletService.processWeeklySettlements();
        console.log(`✅ Đã xử lý ${result.processed} settlements thành công`);
        
        // TODO: Gửi email thông báo cho admin
        // TODO: Gửi email thông báo cho users
        
    } catch (error) {
        console.error('❌ Lỗi xử lý settlements:', error);
        
        // TODO: Gửi email báo lỗi cho admin
    }
});

// Chạy hàng ngày lúc 2:00 để kiểm tra các transactions cũ
cron.schedule('0 2 * * *', async () => {
    console.log('🔍 Kiểm tra transactions chưa settlement...');
    
    try {
        // Logic kiểm tra và gửi cảnh báo nếu có transactions quá 7 ngày chưa xử lý
        // TODO: Implement logic cảnh báo
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra transactions:', error);
    }
});

console.log('📅 Settlement jobs đã được khởi động');
