import mongoose from "mongoose";
const { Schema } = mongoose;

/** result model */
const resultSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    regNo: { type: String, required: true },
    department: { type: String, required: true },
    departmentId: { type: String, required: true },
    points: { type: Number, required: true },
    attempts: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    result: { type: Array, required: true },
    achievedOn: { type: Date, default: Date.now }
});

resultSchema.index({ email: 1, regNo: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);