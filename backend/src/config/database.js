import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Nạp file .env từ thư mục gốc của backend
dotenv.config({ path: path.join(process.cwd(), '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
);

export default sequelize;