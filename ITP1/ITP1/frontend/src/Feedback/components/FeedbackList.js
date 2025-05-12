import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api"; // Ensure API functions are set up
import FeedbackItem from "./FeedbackItem";

const FeedbackList = ({ setEditing }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [userEmail, setUserEmail] = useState(""); // Assuming this is the logged-in user's email

  useEffect(() => {
    // Get logged-in user's email (you may fetch it from context or localStorage)
    const email = localStorage.getItem("userEmail"); // Example: getting email from localStorage
    setUserEmail(email);

    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data);
    };

    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    const result = await deleteFeedback(id, userEmail); // Pass logged-in user's email
    if (result) {
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback._id !== id)
      );
    }
  };
  
  return (
    <div>
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            feedback={feedback}
            onDelete={handleDelete}
            onEdit={setEditing}
            userEmail={userEmail} // Pass logged-in user's email to FeedbackItem
          />
        ))
      )}
    </div>
  );
};

export default FeedbackList;
