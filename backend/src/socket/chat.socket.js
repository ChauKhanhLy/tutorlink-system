import { v4 as uuidv4 } from 'uuid';
import Message from '../models/message.model.js';

const onlineUsers = new Map();

export const getOnlineUserSocket = (userId) => {
  return onlineUsers.get(userId);
};

export const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Đăng ký user online
    socket.on('register_user', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId.toString()); // Đưa vào phòng riêng của user để gửi tới nhiều tab
      console.log(`User ${userId} connected with socket ${socket.id} and joined room`);
    });

    // Gửi tin nhắn
    socket.on('send_message', async (data) => {
      try {
        const { sender_id, receiver_id, content } = data;

        if (!sender_id || !receiver_id || !content) {
          socket.emit('message_error', {
            error: 'Thiếu sender_id, receiver_id hoặc content',
          });
          return;
        }

        const savedMessage = await Message.create({
          id: uuidv4(),
          sender_id,
          receiver_id,
          content,
          sent_at: new Date().toISOString(),
          is_read: false,
        });

        // gửi lại cho người gửi
        socket.emit('receive_message', savedMessage);
        console.log('Message sent back to sender:', sender_id);

        // gửi realtime cho người nhận nếu đang online và không phải là chính mình
        const receiverSocketId = onlineUsers.get(receiver_id);
        if (receiverSocketId && receiverSocketId !== socket.id) {
          io.to(receiverSocketId).emit('receive_message', savedMessage);
          console.log('Message sent to receiver:', receiver_id);
        }
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Đánh dấu đã đọc
    socket.on('mark_as_read', async ({ sender_id, receiver_id }) => {
      try {
        await Message.update(
          { is_read: true },
          {
            where: {
              sender_id,
              receiver_id,
              is_read: false,
            },
          }
        );

        const senderSocketId = onlineUsers.get(sender_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            sender_id,
            receiver_id,
          });
        }
      } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};