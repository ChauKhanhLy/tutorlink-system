import * as authService from '../services/auth.service.js'

// ================= REGISTER =================
const registerLearner = async (req, res) => {
  try {
    const { email, password, name } = req.body

    const user = await authService.register({
      email,
      password,
      name,
      role: 'learner'
    })

    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const registerTutor = async (req, res) => {
  try {
    const { email, password, name } = req.body

    const user = await authService.register({
      email,
      password,
      name,
      role: 'tutor'
    })

    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ================= LOGIN =================
const loginLearner = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await authService.login({ email, password })

    if (result.user.role !== 'learner') {
      return res.status(403).json({ message: "Không phải learner" })
    }

    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

const loginTutor = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await authService.login({ email, password })

    if (result.user.role !== 'tutor') {
      return res.status(403).json({ message: "Không phải tutor" })
    }

    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export default {
  registerLearner,
  registerTutor,
  loginLearner,
  loginTutor
}