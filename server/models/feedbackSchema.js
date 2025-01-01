import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    ratings: {
        q1: { type: Number, required: true, min: 1, max: 5 },
        q2: { type: Number, required: true, min: 1, max: 5 },
        q3: { type: Number, required: true, min: 1, max: 5 }
    },
    comments: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Feedback', feedbackSchema);
