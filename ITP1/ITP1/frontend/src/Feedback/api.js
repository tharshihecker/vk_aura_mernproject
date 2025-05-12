const API_URL = "http://localhost:5000/api/feedback";

export const getFeedbacks = async () => {
  try {
    const res = await fetch(API_URL);
    return await res.json();
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
};

export const addFeedback = async (feedbackData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) throw new Error('Failed to add feedback');
    return await response.json();
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
};

// Like or Unlike feedback
export const toggleLikeFeedback = async (id, userEmail) => {
  try {
    const response = await fetch(`http://localhost:5000/api/feedback/like/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail }),
    });

    if (!response.ok) throw new Error('Failed to toggle like');
    return await response.json();
  } catch (error) {
    console.error('Error liking feedback:', error);
    return null;
  }
};

export const updateFeedback = async (id, formData, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, userEmail }),
    });
    if (!response.ok) throw new Error('Failed to update feedback');
    return await response.json();
  } catch (error) {
    console.error('Error updating feedback:', error);
    return null;
  }
};

export const deleteFeedback = async (id, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail }),
    });
    if (!response.ok) throw new Error('Failed to delete feedback');
    return response.ok;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return false;
  }
};
