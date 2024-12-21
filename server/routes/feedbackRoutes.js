import express from 'express';
import Feedback from '../models/feedbackSchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { username, email, regNo, ratings, comments } = req.body;

        // Validate required fields
        if (!username || !email || !regNo || !ratings || !comments) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newFeedback = new Feedback({
            username,
            email,
            regNo,
            ratings,
            comments
        });

        await newFeedback.save();
        res.json({ success: true, message: 'Feedback submitted successfully' });

    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

export { router as feedbackRouter };
