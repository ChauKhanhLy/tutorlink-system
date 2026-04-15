import * as authService from '../services/auth.service.js'

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = await authService.register({ email, password, name })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export default { register, login }
