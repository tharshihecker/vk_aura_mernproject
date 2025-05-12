import nodemailer from 'nodemailer';

const sendDeletionEmail = async (userDetails, reason) => {
  try {
    if (!userDetails) {
      throw new Error('User details not provided');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "heckerhackie@gmail.com", // Your Gmail
        pass: "sobn xxxl ulca limx",     // App password        // Replace with your app password
      },
    });

    const mailOptions = {
      from: 'VK AURA <your-email@gmail.com>',
      to: userDetails.email,
      subject: 'Your Account Deletion Notice',
      html: `
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/zXvqSKP.png" alt="VK AURA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
            <h2 style="color: #F44336;">Account Deletion Notice</h2>
            <p style="font-size: 16px; font-weight: 500; color: #444;">Dear ${userDetails.name},</p>
            <p style="font-size: 18px; color: #333;">We regret to inform you that your account has been deleted.</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 16px; font-weight: bold; color: #333;">Reason for deletion:</p>
            <p style="font-size: 20px; color: #FF0000;font-weight :bold">${reason}</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 16px; color: #666;">If you have any questions or believe this is a mistake, please contact us.</p>
            <p style="font-size: 14px; color: #888;">Thank you for being a part of VK AURA.</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 14px; color: #888;">✨ <strong>Thank you & Stay Blessed!</strong></p>
            <p style="font-size: 14px; font-weight: 600; color: #F44336;">– Team VK AURA 🕉️</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Deletion email sent successfully!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: error.message };
  }
};

export default sendDeletionEmail;
