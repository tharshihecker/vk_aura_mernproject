import User from '../models/user.model.js';
import DeletedUser from '../models/deletedUser.model.js';
import sendPrayerEmail from '../utils/sendPrayerEmail.js';

import Order from '../models/Order.js';
import sendDeletionEmail from '../utils/sendDeletionEmail.js';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Remove a user
export const removeUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    // Fetch the user before deletion
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Save details for email
    const userDetails = { name: user.name, email: user.email };
    
    await DeletedUser.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profilePic: user.profilePic, // ✅ Add this line
      reason: reason,
    });
    

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Send the deletion email using stored user details
    await sendDeletionEmail(userDetails, reason);

    res.status(200).json({ message: 'User removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error removing user' });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Order.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await DeletedUser.find();
    res.status(200).json(deletedUsers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching deleted users' });
  }
};

// Get user summary by date (join date count)
export const getUserSummary = async (req, res) => {
  try {
    const userSummary = await User.aggregate([
      {
        $match: {
          isAdmin: false // 🔒 Exclude admin users
        }
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          name: 1,
          email: 1,
        }
      },
      {
        $group: {
          _id: "$date", // Group by date
          totalUsers: { $sum: 1 },
          users: { $push: { name: "$name", email: "$email" } }
        }
      },
      { $sort: { _id: -1 } } // Sort by date, latest first
    ]);

    res.status(200).json(userSummary);
  } catch (error) {
    console.error("Error fetching user summary:", error);
    res.status(500).json({ error: 'Failed to fetch user summary' });
  }
};


export const sendPrayerEmailToUser = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !user.personalPrayerWish) {
      return res.status(404).json({ error: 'User or prayer not found.' });
    }

    const result = await sendPrayerEmail(user, message);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to send email.' });
    }

    // ✅ Clear the prayer wish from DB
    user.personalPrayerWish = '';
    await user.save();

    res.status(200).json({ message: 'Blessing email sent successfully and prayer cleared!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

