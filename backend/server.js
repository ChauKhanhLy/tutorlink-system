import 'dotenv/config'
import app from './src/app.js'
import http from 'http'
import { Server } from 'socket.io'
import sequelize from './src/config/database.js'
import { initChatSocket } from './src/socket/chat.socket.js'

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

initChatSocket(io)

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
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
