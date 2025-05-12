import { useState, useEffect } from "react";
import "./FeedbackForm.css";

const FeedbackForm = ({ editFeedback, setEditing, onAdd, onEdit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (editFeedback) {
      setRating(editFeedback.rating);
      setComment(editFeedback.comment);
    }
  }, [editFeedback]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (comment.length < 25) {
      alert("Your comment must be at least 25 characters long.");
      return;
    }
    if (comment.length > 80) {
      alert("Your comment can't be more than 80 characters long.");
      return;
    }
    if (rating === 0) {
      alert("Please provide a rating.");
      return;
    }

    const formData = {
      rating,
      comment
    };

    if (editFeedback) {
      onEdit(editFeedback._id, formData);
    } else {
      onAdd(formData);
    }

    setSuccessMessage("Thank you for your feedback!");

    // Reset form
    setRating(0);
    setComment("");
    setEditing(null);

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getEmoji = (rating) => {
    switch (rating) {
      case 1:
        return "😞";
      case 2:
        return "😐";
      case 3:
        return "🙂";
      case 4:
        return "😃";
      case 5:
        return "😍";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your feedback"
        rows="4"
        required
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      ></textarea>

      <div className="rating-container" style={{ marginBottom: "10px" }}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                color: rating >= star ? "gold" : "gray",
                cursor: "pointer",
                fontSize: "30px",
              }}
            >
              &#9733;
            </span>
          ))}
        </div>
        {rating > 0 && <span className="emoji" style={{ marginLeft: "10px", fontSize: "24px" }}>{getEmoji(rating)}</span>}
      </div>

      <button
        type="submit"
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          width: "100%",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {editFeedback ? "Update Feedback" : "Submit Feedback"}
      </button>

      {successMessage && (
        <div className="success-popup" style={{
          marginTop: "10px",
          backgroundColor: "#dff0d8",
          color: "#3c763d",
          padding: "10px",
          borderRadius: "4px",
        }}>
          <p>{successMessage}</p>
        </div>
      )}
    </form>
  );
};

export default FeedbackForm;
