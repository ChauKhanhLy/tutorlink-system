import { buildAvailabilitySlots } from '../services/tutorAvailability.service.js'

export const getTutorAvailability = async (req, res) => {
  try {
    const { id } = req.params
    const slots = await buildAvailabilitySlots(id)
    res.json(slots)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
