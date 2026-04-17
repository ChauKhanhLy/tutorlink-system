import { buildAvailabilitySlots } from '../services/tutorAvailability.service.js'

export const getTutorAvailability = async (req, res) => {
  try {
    const { id } = req.params
    const availableSlots = await buildAvailabilitySlots(id)

    res.status(200).json({
      success: true,
      data: {
        availableSlots
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}
