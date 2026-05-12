import * as authService from '../services/auth.service.js'
import * as userDAL from '../dal/user.dal.js'
import {
  verifyOTP
} from '../services/auth.service.js'
const registerLearner = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = await authService.registerLearner({ email, password, name })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
export const registerTutor = async (req, res) => {
  try {
    const { email, password, name } = req.body
    const user = await authService.registerTutor({ email, password, name })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
export const getMe = async (req, res) => {
  const user = await userDAL.findById(req.user.id);
  res.json(user);
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    res.json(result)
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
}

export const verifyOTPController = async (
  req,
  res
) => {

  try {

    const user =
      await verifyOTP(req.body)

    res.json({
      message: 'Register successful',
      user
    })

  } catch (error) {

    console.error(error)

  return res.status(400).json({
    message: error.message
  })
  }
}

export default {
  registerLearner,
  registerTutor,
  login,
  verifyOTPController
}
