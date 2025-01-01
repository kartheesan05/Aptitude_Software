import mongoose from "mongoose";
const { Schema } = mongoose;

const timerSettingsSchema = new Schema({
    durationInMinutes: { 
        type: Number, 
        required: true,
        default: 90
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('TimerSettings', timerSettingsSchema);
