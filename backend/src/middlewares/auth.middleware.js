const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization   // lấy header

  if (!authHeader) {
    return res.status(401).json({ message: "No token" })
  }

  try {
    //  tách "Bearer <token>"
    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, SECRET)

    req.user = decoded

    next()
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" })
  }
}