import mongoose from "mongoose";
const { Schema } = mongoose;

const sectionScoreSchema = new Schema(
  {
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
  },
  { _id: false }
);

const questionResultSchema = new Schema(
  {
    section: {
      type: String,
      enum: ["aptitude", "core", "verbal", "programming", "comprehension"],
      required: true,
    },
    question: { type: String, required: true },
    submitted: { type: Number },
    correct: { type: Number, required: true },
    points: { type: Number, default: 0 },
  },
  { _id: false }
);

/** result model */
const resultSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  regNo: { type: String, required: true, unique: true },
  dept: { type: String },
  points: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  result: [questionResultSchema],
  sectionScores: {
    aptitude: sectionScoreSchema,
    core: sectionScoreSchema,
    verbal: sectionScoreSchema,
    programming: sectionScoreSchema,
    comprehension: sectionScoreSchema,
  },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Result", resultSchema);
