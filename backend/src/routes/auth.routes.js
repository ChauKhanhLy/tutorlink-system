const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const SECRET = "mysecretkey"

const user = {
  id: 1,
  username: "admin",
  password: "123456"
}

router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (username !== user.username || password !== user.password) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "1h" }
  )

  res.json({
    message: "Login success",
    token
  })
})

module.exports = router