import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To manage loading state for profile fetch
  const [error, setError] = useState(""); // Manage error state if any API call fails
  const navigate = useNavigate(); // To handle navigation

  // Check if there's a token and fetch the user profile
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Set timeout to remove token after 1 hour (3600000 ms)
      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        setUser(null); // Clear user data
        navigate("/login"); // Redirect to login if the token expires
      }, 3600000); // 1 hour

      // Fetch the user profile using the stored token
      axios
        .get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }, // Send token in the header
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((error) => {
          console.error("Error fetching user profile", error);
          setUser(null); // Clear user data if there's an error
          setError("Failed to fetch user profile. Please log in again.");
          navigate("/login"); // Redirect to login if unauthorized
        })
        .finally(() => {
          setLoading(false); // End loading after profile fetch attempt
        });

      // Clear the timeout if the component is unmounted
      return () => clearTimeout(timer);
    } else {
      setLoading(false); // End loading if no token is present
      setUser(null); // No user data if token is missing
      navigate("/login") // redirect to login if no token is present.
    }
  }, [navigate]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("token", res.data.token); // Save token to localStorage
      setUser(res.data.user); // Set user profile after successful login

      // Check if the user is an admin
      if (res.data.isAdmin) {  // Corrected here, accessing `isAdmin` directly from the response
        // Redirect to admin dashboard if the user is an admin
        navigate("/admin-dashboard");
      } else {
        // Redirect to user home page if the user is not an admin
        navigate("/user-home");
      }
    } catch (error) {
      console.error("Login failed", error.response?.data?.message || error.message);
      setUser(null); // Reset user state on failure
      setError("Invalid email or password."); // Set error message to be displayed in Login page
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    setUser(null); // Clear user data
    navigate("/login"); // Redirect to login page after logout
  };

  return { user, loading, error, login, logout };
};