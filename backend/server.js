require('dotenv').config()
const app = require('./src/app')

const http = require('http')
const { Server } = require('socket.io')

// 👇 nếu bạn dùng sequelize
const sequelize = require('./src/config/database')

// 👇 socket
const { initChatSocket } = require('./src/socket/chat.socket')

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initChatSocket(io)

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    // DB connect
    if (sequelize?.authenticate) {
      await sequelize.authenticate()
      console.log('Kết nối database thành công')
    }

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Lỗi khởi động:', err)
  }
}

startServer()