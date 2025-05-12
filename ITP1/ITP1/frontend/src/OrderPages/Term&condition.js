import React from "react";
import "./TermsAndConditions.css";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
    const navigate = useNavigate();
  return (
    <div className="terms-container">
      <h1>📜 Terms & Conditions</h1>
      <p className="para">Welcome to VK Aura. Please read these terms carefully before using our services.</p>

      <p className="pterm">🛒 Order Confirmation & Returns</p>
      <p className="para">
         ✅ Once an order is confirmed, it cannot be canceled, modified, or returned.<br />
         ❌ We do not accept refunds or exchanges unless the item received is defective or incorrect.<br />
         📢 Any issues must be reported within 24 hours of delivery.
      </p>

      <p className="pterm">💰 Payment & Pricing</p>
      <p className="para">
         💲 All prices are listed in the applicable currency and include taxes unless otherwise stated.<br />
         ⚠️ VK Aura reserves the right to change product prices at any time without prior notice.<br />
         🏦 Orders will only be processed upon successful payment confirmation.
      </p>

      <p className="pterm">🚚 Delivery Policy</p>
      <p className="para">
         ⏳ Delivery times are estimated and may be subject to delays due to unforeseen circumstances.<br />
         📍 Customers must provide accurate delivery information. VK Aura is not responsible for delays caused by incorrect details.<br />
         📩 In case of non-receipt, customers must notify us within 48 hours.
      </p>

      <p className="pterm">🛡️ Product Quality & Responsibility</p>
      <p className="para">
         🏆 We ensure the highest quality of our products; however, we are not liable for damages caused due to improper handling after delivery.<br />
         🎨 Items may slightly differ from images shown due to variations in lighting and materials.
      </p>

      <p className="pterm">🔒 Privacy & Security</p>
      <p className="para">
         🔏 VK Aura respects customer privacy and does not share personal information with third parties without consent.<br />
         💳 Transactions are secured, and we do not store payment details.
      </p>

      <p className="pterm">🔄 Changes to Terms</p>
      <p className="para">
         ⚖️ VK Aura reserves the right to update these terms at any time. Continued use of our platform implies acceptance of changes.
      </p>

      <p className="pterm">📩 Contact Us</p>
      <p className="para">
        If you have any questions regarding these terms, feel free to contact us at <a href="mailto:support@vkaura.com">support@vkaura.com</a>.
      </p>

      <button className="back-button" onClick={() => navigate("/order")}>⬅ Back </button>
    </div>
  );
};

export default TermsAndConditions;
