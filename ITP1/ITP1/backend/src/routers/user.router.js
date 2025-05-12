import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  checkEmail,
  sendOTP,
  verifyOTP,
  sendForgotPasswordOTP,
  checkForgotPasswordEmail,
  requestForgotPassword,
  deleteAccount

} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

// ✅ Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

// ✅ Check if Email Exists Before Registration
router.post("/check-email", checkEmail);

// ✅ New Routes for Forgot Password Flow
router.post("/check-forgot-password-email", checkForgotPasswordEmail);  // Check if email exists for password reset
router.post("/send-forgot-password-otp", sendForgotPasswordOTP);  // Send OTP for password reset

// ✅ OTP Routes (Moved logic to `authController.js`)
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/request-forgot-password", requestForgotPassword);


// ✅ Protected Routes (Require Authentication)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);  // Updated to DELETE


export default router;
