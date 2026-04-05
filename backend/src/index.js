import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import bookingRoutes from './routes/booking.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/bookings', bookingRoutes);

const startServer = async () => {
    try {
        await sequelize.sync({ alter: true }); 
        console.log('✅ Database & Tables đã được đồng bộ hóa thành công!');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động hệ thống:', error);
    }
};

startServer();