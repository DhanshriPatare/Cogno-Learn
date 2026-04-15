import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import { StudyPlan } from '../models/StudyPlan.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Chat history
router.get('/chat', async (req: AuthRequest, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user?.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { role, text } = req.body;
    const message = new ChatMessage({ userId: req.user?.id, role, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Study Plans
router.get('/planner', async (req: AuthRequest, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/planner', async (req: AuthRequest, res) => {
  try {
    const { topic, timeframe, plan } = req.body;
    const studyPlan = new StudyPlan({ userId: req.user?.id, topic, timeframe, plan });
    await studyPlan.save();
    res.status(201).json(studyPlan);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
