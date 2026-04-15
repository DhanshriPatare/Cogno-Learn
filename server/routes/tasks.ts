import express from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const tasks = await Task.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { text } = req.body;
    const task = new Task({ userId: req.user?.id, text });
    await task.save();

    // Log activity
    await User.findByIdAndUpdate(req.user?.id, {
      $push: {
        activityLog: {
          $each: [{
            type: 'target',
            description: `Added task: ${text}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }],
          $slice: -20
        }
      }
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { done } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { done },
      { new: true }
    );

    if (done) {
      // Update productivity score for today (Mon-Sun)
      const dayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
      const user = await User.findById(req.user?.id);
      if (user) {
        const newProd = [...user.productivity];
        newProd[dayIndex] += 10;
        user.productivity = newProd;
        user.activityLog.push({
          type: 'success',
          description: `Completed task: ${task?.text}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (user.activityLog.length > 20) user.activityLog.shift();
        await user.save();
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
