import nodemailer from 'nodemailer';

const sendStatusUpdateEmail = async (orderDetails) => {
  try {
    if (!orderDetails || !orderDetails.email || !orderDetails.status || !orderDetails.name || !orderDetails.orderId) {
      throw new Error('Incomplete order details');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "", // Your Gmail
        pass: "",    // App password
      },
    });

    const statusColor = {
      success: "#4CAF50",
      removed: "#f44336",
      shipped: "#2196F3",
      delivered: "#FF9800"
    };
    transporter.verify(function (error, success) {
        if (error) {
          console.error('❌ SMTP Error:', error);
        } else {
          console.log('✅ Server is ready to send messages');
        }
      });

    const color = statusColor[orderDetails.status] || "#333";
    

    const mailOptions = {
      from: 'VK AURA <heckerhackie@gmail.com>',
      to: orderDetails.email,
      subject: `🛒 Order #${orderDetails.orderId} Status: ${orderDetails.status.toUpperCase()}`,
      html: `
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/zXvqSKP.png" alt="VK AURA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
            <h2 style="color: ${color};">Order Status Update</h2>
            <p style="font-size: 16px; font-weight: 500; color: #444;">Dear ${orderDetails.name},</p>
            <p style="font-size: 18px; color: #333;">Your order <strong>#${orderDetails.orderId}</strong> has been updated to:</p>
            <p style="font-size: 22px; font-weight: bold; color: ${color}; text-transform: uppercase;">${orderDetails.status}</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 16px; color: #666;">If you have any questions about your order, feel free to reach out to our support team.</p>
            <p style="font-size: 14px; color: #888;">We appreciate your trust in VK AURA!</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 14px; color: #888;">🧘 <strong>Stay Safe & Blessed!</strong></p>
            <p style="font-size: 14px; font-weight: 600; color: ${color};">– Team VK AURA 🕉️</p>
          </div>
        </div>
      `,
    };

    console.log("Sending email to", orderDetails.email);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${orderDetails.email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending status update email:", error);
    return { success: false, message: error.message };
  }
};

export default sendStatusUpdateEmail;
