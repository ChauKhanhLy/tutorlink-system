import * as BookingService from '../services/booking.service.js';
export const postBooking = async (req, res) => {
    try {
        /*const learner_id = req.user.id;*/
        const learner_id = "fe503b3d-9dac-4743-a7fa-eec8f41ed80a";

        const newBooking = await BookingService.createBooking ({
            ...req.body,
            learner_id
        });
        
        res.status(201).json({ success: true, data: newBooking});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const learner_id = "fe503b3d-9dac-4743-a7fa-eec8f41ed80a";
        const bookings = await BookingService.getMyBookings(learner_id);

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: BookingService
        });
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};