import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFeedbacks, addFeedback, updateFeedback, deleteFeedback, toggleLikeFeedback } from "../api";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackItem from "../components/FeedbackItem";
import { useAuth } from "../../hooks/useAuth";
import UserComponent from "../../Component/Usercomponent";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data);
    };

    fetchFeedbacks();
  }, [user, authLoading, navigate]);

  const handleAddFeedback = async (formData) => {
    try {
      const newFeedback = await addFeedback({ ...formData, userEmail: user.email });
      setFeedbacks((prev) => [...prev, newFeedback]);
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  const handleEditFeedback = async (id, formData) => {
    const updatedFeedback = await updateFeedback(id, formData, user.email);
    if (updatedFeedback) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? updatedFeedback : fb))
      );
      setEditing(null);
    }
  };

  const handleDeleteFeedback = async (id) => {
    const success = await deleteFeedback(id, user.email);
    if (success) {
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    }
  };

  const handleLikeFeedback = async (id) => {
    const updated = await toggleLikeFeedback(id, user.email);
    if (updated) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? updated : fb))
      );
    }
  };

  return (
    <div className="dashboard-container" style={{ 
      fontFamily: "Arial", 
      backgroundImage: "url('/your-background-image-path.jpg')", 
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      backgroundRepeat: "no-repeat", 
      minHeight: "100vh",
      marginTop:"30px",
    }}>
      <UserComponent user={user} />

      
      <main className="dashboard-content" style={{ padding: "20px" }}>
        <div style={{ 
          maxWidth: "700px",
          margin: "40px auto",
          padding: "30px",
          borderRadius: "15px",
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
        }}>


<p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
Give Your Feedback</p>
        

          <FeedbackForm
            editFeedback={editing}
            setEditing={setEditing}
            onAdd={handleAddFeedback}
            onEdit={handleEditFeedback}
          />

          <button
            onClick={() => setIsFeedbackVisible(!isFeedbackVisible)}
            style={{ width:"100%", marginTop: "20px", padding: "10px 25px", backgroundColor: " #1976d2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            {isFeedbackVisible ? "Hide Feedbacks" : "View Feedbacks"}
          </button>

          {isFeedbackVisible && (
            <>
              <h3 style={{ marginTop: "20px" }}>All Feedbacks</h3>
              {feedbacks.length === 0 ? (
                <p>No feedback available.</p>
              ) : (
                <>
                  <h4 style={{ marginTop: "15px", color: "#374495" }}>🧑‍💼 Your Feedbacks</h4>
                  {feedbacks
                    .filter((fb) => fb.userEmail === user.email)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((feedback) => (
                      <div key={feedback._id} style={{ marginBottom: "10px" }}>
                        <FeedbackItem
                          feedback={feedback}
                          canEdit={true}
                          onEdit={() => setEditing(feedback)}
                          onDelete={() => handleDeleteFeedback(feedback._id)}
                          onLike={handleLikeFeedback}
                          userEmail={user.email}
                        />
                      </div>
                    ))}

                  <h4 style={{ marginTop: "30px", color: "#888" }}>🌍 Other Users' Feedbacks</h4>
                  {feedbacks
                    .filter((fb) => fb.userEmail !== user.email)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((feedback) => (
                      <div key={feedback._id} style={{ marginBottom: "10px" }}>
                        <FeedbackItem
                          feedback={feedback}
                          canEdit={false}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onLike={handleLikeFeedback}
                          userEmail={user.email}
                        />
                      </div>
                    ))}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: "40px" }}>
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeedbackPage;
