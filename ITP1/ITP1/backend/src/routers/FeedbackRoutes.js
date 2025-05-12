import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new feedback
router.post('/', async (req, res) => {
  const { rating, comment, userEmail } = req.body;

  if (!rating || !comment || !userEmail) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newFeedback = new Feedback({ rating, comment, userEmail });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LIKE or UNLIKE a feedback
router.post('/like/:id', async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email is required' });
  }

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const alreadyLiked = feedback.likes.includes(userEmail);

    if (alreadyLiked) {
      // Unlike
      feedback.likes = feedback.likes.filter(email => email !== userEmail);
    } else {
      // Like
      feedback.likes.push(userEmail);
    }

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update feedback
router.put('/:id', async (req, res) => {
  const { rating, comment, userEmail } = req.body;

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    if (feedback.userEmail !== userEmail) {
      return res.status(403).json({ message: 'Unauthorized to edit this feedback' });
    }

    feedback.rating = rating;
    feedback.comment = comment;

    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE Feedback Route
router.delete('/:id', async (req, res) => {
  const { userEmail } = req.body;

  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    
    const emailOnly = userEmail?.split('#')[0]; // ✅ real email
    const isAdmin = userEmail?.endsWith('#admin');
    const isOwner = emailOnly === feedback.userEmail;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this feedback' });
    }
    

    await feedback.deleteOne();
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




export default router;
