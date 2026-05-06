import 'dotenv/config'
import app from './src/app.js'
import http from 'http'
import { Server } from 'socket.io'
import sequelize from './src/config/database.js'
import { initChatSocket } from './src/socket/chat.socket.js'
import './src/jobs/settlement.job.js'

const server = http.createServer(app)

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
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
