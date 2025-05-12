import express from 'express';
import sendStatusUpdateEmail from '../utils/sendStatusUpdateEmail.js';

const router = express.Router();

router.post('/send-status-email', async (req, res) => {
    console.log("📩 Email API route hit:", req.body); 
  const { orderId, status, userEmail, userName } = req.body;

  try {
    const result = await sendStatusUpdateEmail({
      orderId,
      status,
      email: userEmail,
      name: userName
    });

    if (result.success) {
      res.status(200).json({ message: "Email sent successfully." });
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to send email." });
  }
});

export default router;
