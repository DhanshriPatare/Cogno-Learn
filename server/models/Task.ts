import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
