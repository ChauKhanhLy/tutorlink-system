import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

import sequelize from './config/database.js';
import messageRouter from './src/router/message.router.js';
import { initChatSocket } from './src/socket/chat.socket.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/messages', messageRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initChatSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công');

    server.listen(PORT, () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động hệ thống:', error);
  }
};

startServer();