import express from 'express';
import Feedback from '../models/feedbackSchema.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { username, email, ratings, comments } = req.body;

        // Create new feedback
        const newFeedback = new Feedback({
            username,
            email,
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
