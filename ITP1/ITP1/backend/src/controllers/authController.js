import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendOTPEmail from "../utils/emailService.js";
import TempUser from "../models/tempUser.model.js";
import sendSurveyEmail from '../utils/sendSurveyEmail.js'; // Import the new function
import DeletedUser from "../models/deletedUser.model.js";



// Check Email
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format using a regex
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        exists: true, 
        message: "Invalid email format." 
      });
    }

    // Check if email exists in the deleted users collection
    const deletedUser = await DeletedUser.findOne({ email });
    if (deletedUser) {
      return res.status(400).json({ 
        exists: true, 
        message: "Account removed. Email can't be reused." 
      });
    }

    // Check if email exists in the active users collection
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        exists: true,
        message: "Email already registered. Please login."
      });
    }

    // If email does not exist anywhere, you can move to sending OTP
    res.json({ exists: false, message: "Email is available." });
  } catch (error) {
    console.error("❌ Error in checkEmail:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    let tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      tempUser = new TempUser({ email, otp, otpExpiration });
    } else {
      tempUser.otp = otp;
      tempUser.otpExpiration = otpExpiration;
    }

    await tempUser.save();
    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to email!" });
  } catch (error) {
    console.error("❌ Error in sendOTP:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser || tempUser.otpExpiration < new Date() || tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    res.json({ message: "OTP Verified!" });
  } catch (error) {
    console.error("❌ Error in verifyOTP:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, address, phone } = req.body;

    if (!name || !email || !password || !confirmPassword || !address || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    const user = new User({ name, email, password, address, phone });
    await user.save();

    res.status(201).json({ message: "Signup successful. Please login!" });
  } catch (error) {
    console.error("❌ Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      userId: user._id,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error in getProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, address, phone, profilePic, personalPrayerWish } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.name = name || user.name;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.profilePic = profilePic || user.profilePic;

    if (personalPrayerWish !== undefined) {
      user.personalPrayerWish = personalPrayerWish;
    }

    await user.save();
    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("❌ Error in updateProfile:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password." });
    user.password = newPassword;

    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    
    // Validate email format using a regex
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

    let tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      tempUser = new TempUser({ email, otp, otpExpiration });
    } else {
      tempUser.otp = otp;
      tempUser.otpExpiration = otpExpiration;
    }

    await tempUser.save();

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email." });
    }

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error("❌ Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const checkForgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ exists: false, message: "Email is required." });
    }
    
    // Validate email format using a regex
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ exists: false, message: "Invalid email format." });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ exists: false, message: "Email not registered." });
    }
    res.json({ exists: true, message: "Email found. Please proceed to OTP verification." });
  } catch (error) {
    console.error("❌ Error in checkForgotPasswordEmail:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// Forgot Password - Step 2: Send OTP
export const sendForgotPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

    let tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      tempUser = new TempUser({ email, otp, otpExpiration });
    } else {
      tempUser.otp = otp;
      tempUser.otpExpiration = otpExpiration;
    }

    await tempUser.save();
    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to email!" });
  } catch (error) {
    console.error("❌ Error in sendForgotPasswordOTP:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Forgot Password - Step 3: Verify OTP & Reset Password
export const requestForgotPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser || tempUser.otpExpiration < new Date() || tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    await TempUser.deleteOne({ email });

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete User Account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    await User.findByIdAndDelete(userId);
    // Send survey email after account deletion
    await sendSurveyEmail(user.email);

    res.json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("❌ Error in deleteAccount:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};