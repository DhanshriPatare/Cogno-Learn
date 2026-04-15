import express from 'express';
import { MoodLog } from '../models/MoodLog.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const logs = await MoodLog.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { mood, suggestion, activity, imageKeyword, overlayColor } = req.body;
    const log = new MoodLog({
      userId: req.user?.id,
      mood,
      suggestion,
      activity,
      imageKeyword,
      overlayColor
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
