const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  res.json([
    { id: 1, name: "Nguyen Van A", subject: "Math" },
    { id: 2, name: "Tran Thi B", subject: "English" }
  ])
})

module.exports = router