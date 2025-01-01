import express from 'express';
import TimerSettings from '../models/timerSettings.js';
const router = express.Router();

router.get('/duration', async (req, res) => {
    try {
        const settings = await TimerSettings.findOne({ isActive: true });
        res.json({ durationInMinutes: settings?.durationInMinutes || 90 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timer duration' });
    }
});

router.post('/update', async (req, res) => {
    try {
        const { durationInMinutes } = req.body;
        await TimerSettings.updateOne(
            { isActive: true },
            { durationInMinutes },
            { upsert: true }
        );
        res.json({ message: 'Timer duration updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating timer duration' });
    }
});

export default router;
