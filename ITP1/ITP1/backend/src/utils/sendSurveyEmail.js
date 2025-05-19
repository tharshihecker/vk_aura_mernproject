import nodemailer from 'nodemailer';

const sendSurveyEmail = async (email) => {
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
      subject: "We’re Sorry to See You Go | VK AURA",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/zXvqSKP.png" alt="VK AURA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
              <h2 style="color: #4CAF50;">Goodbye from VK AURA 😔</h2>
              <p style="font-size: 16px; font-weight: 500; color: #444;">We're sorry to see you go!</p>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 18px; font-weight: bold; color: #333;">We value your feedback!</p>
              <p style="font-size: 16px; color: #666;">Could you please help us improve by answering a few quick questions? Your feedback is important to us.</p>
              <ul style="list-style-type: none; padding: 0;">
                <li style="font-size: 14px; font-weight: 500; color: #333;">1. Why did you decide to delete your account?</li>
                <li style="font-size: 14px; font-weight: 500; color: #333;">2. How can we improve our service?</li>
                <li style="font-size: 14px; font-weight: 500; color: #333;">3. Is there anything we could have done differently?</li>
              </ul>
              <p style="font-size: 16px; color: #666;">Please reply to this email with your responses, or you can fill out our survey form here:</p>
              <a href="https://vkaura.com" style="font-size: 16px; color: #4CAF50; text-decoration: none;">Take the Survey</a>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 14px; font-weight: 500; color: #888;">Thank you for your time and support!</p>
              <p style="font-size: 14px; font-weight: 600; color: #4CAF50;">– Team VK AURA 🕉️</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Survey email sent successfully!");
    return { success: true, message: "Survey email sent successfully!" };
  } catch (error) {
    console.error("❌ Error sending survey email:", error);
    return { success: false, message: "Failed to send survey email." };
  }
};

export default sendSurveyEmail;
