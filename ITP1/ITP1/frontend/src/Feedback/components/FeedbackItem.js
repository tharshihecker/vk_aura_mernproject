import React from "react";

const FeedbackItem = ({ feedback, onEdit, onDelete, canEdit, onLike, userEmail }) => {
  const handleDelete = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this feedback?");
    if (isConfirmed) {
      onDelete(feedback._id);
    }
  };

  const handleEdit = () => {
    window.scrollTo(0, 0);
    onEdit(feedback);
  };

  const hasLiked = feedback.likes.includes(userEmail);

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
      }}
    >
      {/* Star Rating */}
      <div style={{ marginBottom: "10px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: feedback.rating >= star ? "gold" : "gray",
              fontSize: "24px",
            }}
          >
            &#9733;
          </span>
        ))}
      </div>

      {/* Comment */}
      <p style={{ fontSize: "14px", marginBottom: "10px", color: "#333" }}>
        {feedback.comment}
      </p>

      {/* Like Heart Button with Hover Animation */}
      <div style={{
  width: "100%", 
  display: "flex", 
  justifyContent: "center", // 🌟 Center the button horizontally
  alignItems: "center"
}}>
  <button
    onClick={() => onLike(feedback._id)}
    style={{
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      marginBottom: "10px",
      display: "flex",
      flexDirection: "column",   // stack heart and number vertically
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 0.2s ease",
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
  >
    {/* Heart Icon */}
    <span
      style={{
        fontSize: "32px",
        color: hasLiked ? "red" : "black",
        marginBottom: "4px",
      }}
    >
      {hasLiked ? "❤️" : "🤍"}
    </span>

    {/* Like Count */}
    <span
      style={{
        fontSize: "18px",
        color: "#333",
      }}
    >
      {feedback.likes.length}
    </span>
  </button>
</div>


      {/* Edit and Delete Buttons */}
      {canEdit && (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={handleEdit}
            style={{
              width: "100px",
              padding: "8px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              width: "100px",
              padding: "8px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackItem;
