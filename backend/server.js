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
app.set('io', io)

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    if (sequelize?.authenticate) {
      await sequelize.authenticate()
      console.log('✅ Database connection successful')
    }

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('❌ Server startup error:', err.message)
    process.exit(1)
  }
}

// Handle unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

startServer()
