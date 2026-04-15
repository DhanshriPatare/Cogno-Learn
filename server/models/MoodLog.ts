import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, required: true },
  suggestion: { type: String },
  activity: { type: String },
  imageKeyword: { type: String },
  overlayColor: { type: String }
}, { timestamps: true });

export const MoodLog = mongoose.model('MoodLog', moodLogSchema);
