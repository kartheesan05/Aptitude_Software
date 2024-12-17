import mongoose from "mongoose";
const { Schema } = mongoose;

/** result model */
const resultSchema = new Schema({
    username: { type: String },
    email: { type: String },
    regNo: { type: String, unique: true },
    dept: { type: String },
    result: { type: Array },
    attempts: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    totalQuestions: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('result', resultSchema);