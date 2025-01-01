import mongoose from "mongoose";
const { Schema } = mongoose;

const activeSessionSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
        },
        index: { expires: 0 }
    }
});

activeSessionSchema.index({ email: 1, regNo: 1 }, { unique: true });

export default mongoose.model('ActiveSession', activeSessionSchema);
