import mongoose from "mongoose";
const { Schema } = mongoose;

/** Question Schema */
const questionSchema = new Schema({
    category: String,
    subCategory: String,
    question: String,
    options: [String],
    correctAnswer: Number,
    createdAt: { type: Date, default: Date.now }
});

// Create models for each category
export const AptitudeQuestion = mongoose.model('AptitudeQuestion', questionSchema);
export const CoreQuestion = mongoose.model('CoreQuestion', questionSchema);
export const VerbalQuestion = mongoose.model('VerbalQuestion', questionSchema);
export const ProgrammingQuestion = mongoose.model('ProgrammingQuestion', questionSchema);