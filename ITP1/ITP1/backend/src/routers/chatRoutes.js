import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

// ✅ Corrected chat fetch route
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const chats = await Chat.find({
      $or: [
        { senderId: 'admin', receiverId: email },
        { senderId: email, receiverId: 'admin' }
      ]
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

export default router;
