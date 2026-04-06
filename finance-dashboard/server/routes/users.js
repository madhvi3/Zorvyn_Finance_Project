import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    const { role, status } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { email, name } = req.body;

    let user = await User.findOne({ clerkId });

    // If user doesn't exist in our DB, create them
    if (!user) {
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "Admin" : "Viewer";

      user = new User({ clerkId, email, name, role });
      await user.save();
      console.log(`Successfully synced local user: ${clerkId} with role ${role}`);
    }

    res.json(user);
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
