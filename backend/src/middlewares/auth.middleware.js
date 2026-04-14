import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

// middleware check login
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: "No token" })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, SECRET)

    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" })
  }
}

// middleware check admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden" })
  }
  next()
}

export default authMiddleware
export { isAdmin }
