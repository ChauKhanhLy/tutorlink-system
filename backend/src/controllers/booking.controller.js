import * as BookingService from '../services/booking.service.js';
export const postBooking = async (req, res) => {
    try {
        /*const learner_id = req.user.id;*/
        const learner_id = 1;

        const newBooking = await BookingService.createBooking ({
            ...req.body,
            learner_id
        });
        
        res.status(201).json({ success: true, data: newBooking});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};