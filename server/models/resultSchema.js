import mongoose from "mongoose";
const { Schema } = mongoose;

/** result model */
const resultSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    regNo: { type: String, required: true, unique: true },
    dept: { type: String },
    points: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    totalQuestions: { type: Number },
    result: { type: Array, default: [] }
});

export default mongoose.model('Result', resultSchema);