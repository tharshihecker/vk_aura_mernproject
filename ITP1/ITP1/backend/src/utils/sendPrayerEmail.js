import nodemailer from 'nodemailer';

const sendPrayerEmail = async (user, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'heckerhackie@gmail.com',
        pass: 'sobn xxxl ulca limx',
      },
    });

    const mailOptions = {
      from: 'VK AURA <heckerhackie@gmail.com>',
      to: user.email,
      subject: '💌 A Special Blessing from VK AURA',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f4f8;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/zXvqSKP.png" alt="VK AURA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
              <h2 style="color: #4CAF50;">💫 A Blessing from VK AURA 🙏</h2>
              <p style="font-size: 20px; font-weight: bold; color: #374495;">Dear <span style="color: #0e6ba8;">${user.name}</span>,</p>
              <p style="font-size: 18px; font-weight: 500; color: #444;">Here is a special message just for you:</p>
              <blockquote style="font-size: 22px; font-weight: bold; font-style: italic; background: #fff8e1; padding: 20px 25px; border-left: 8px solid #6c63ff; color: #333; margin: 20px 0; border-radius: 8px;">
                ${message}
              </blockquote>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 14px; font-weight: 500; color: #888;">Thank you for being a part of our spiritual journey.</p>
              <p style="font-size: 14px; font-weight: 500; color: #888;">✨ <strong>Stay Blessed & Guided Always!</strong></p>
              <p style="font-size: 14px; font-weight: 600; color: #4CAF50;">– Team VK AURA 🕉️</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Blessing email sent successfully!");
    return { success: true };
  } catch (err) {
    console.error("❌ Error sending blessing email:", err);
    return { success: false, message: err.message };
  }
};

export default sendPrayerEmail;
