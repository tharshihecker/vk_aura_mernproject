import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: [25, 'Comment must be at least 25 characters long'],
    maxlength: [80, 'Comment must be less than 80 characters long']
  },
  userEmail: {
    type: String,
    required: true
  },
  likes: {
    type: [String], // Array of user emails who liked
    default: []
  }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
