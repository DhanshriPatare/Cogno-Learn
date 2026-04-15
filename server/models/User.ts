import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  productivity: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
  activityLog: [{
    type: { type: String },
    description: { type: String },
    time: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
