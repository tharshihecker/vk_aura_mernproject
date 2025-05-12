import React, { useState } from "react";
import axios from "axios";
import { Modal, Rate, Button, message } from "antd";

const RatingModal = ({ visible, onClose, userEmail, orderId }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const emojiMap = {
    1: "😡",
    2: "😕",
    3: "😐",
    4: "🙂",
    5: "😍",
  };

  const handleSubmitRating = async () => {
    if (!rating) {
      message.warning("Please select a rating before submitting!");
      return;
    }
    if (!orderId) {
      message.error("Order ID missing. Cannot submit rating.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/order-rating/add", {
        userEmail,
        rating,
        orderId,
      });
      message.success("✅ Thank you for your rating!");
      onClose();
    } catch (error) {
      console.error("Rating submission failed:", error);
      message.error("❌ Failed to submit rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      title="Rate Your Experience ✨"
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Rate
          value={rating}
          onChange={setRating}
          style={{ fontSize: "30px" }}
        />
        <div style={{ fontSize: "40px", marginTop: "10px" }}>
          {emojiMap[rating]}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmitRating}
        >
          Submit Rating
        </Button>
      </div>
    </Modal>
  );
};

export default RatingModal;
