import nodemailer from 'nodemailer';

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "", // Your Gmail
        pass: "",     // App password
      },
    });

    const mailOptions = {
      from: "VK AURA <heckerhackie@gmail.com>",
      to: email,
      subject: "🔐 Your OTP Code for VK AURA",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/zXvqSKP.png" alt="VK AURA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
              <h2 style="color: #4CAF50;">Welcome to VK AURA 🙏</h2>
              <p style="font-size: 16px; font-weight: 500; color: #444;">Thank you for registering with us!</p>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 18px; font-weight: bold; color: #333;">🔐 Your One-Time Password (OTP):</p>
              <div style="font-size: 36px; font-weight: bold; color: #000; margin: 10px 0 20px;">${otp}</div>
              <p style="font-size: 16px; font-weight: 500; color: #666;">This OTP is valid for <strong>5 minutes</strong>. Please <strong>do not share it</strong> with anyone.</p>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 14px; font-weight: 500; color: #888;">If you did not request this OTP, please ignore this email.</p>
              <p style="font-size: 14px; font-weight: 500; color: #888;">✨ <strong>Thank you & Stay Blessed!</strong></p>
              <p style="font-size: 14px; font-weight: 600; color: #4CAF50;">– Team VK AURA 🕉️</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully!");
    return { success: true, message: "OTP sent successfully!" };
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP." };
  }
};

export default sendOTPEmail;
