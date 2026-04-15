import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  timeframe: { type: String, required: true },
  plan: [{
    day: Number,
    focus: String,
    tasks: [String]
  }]
}, { timestamps: true });

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
