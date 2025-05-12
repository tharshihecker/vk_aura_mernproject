import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewProfilePage.css';
//import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation"; 

const AdminProfile = () => {
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch(() => {
        setError('❌ Error fetching profile');
        localStorage.removeItem('token');
        navigate('/login');
      });
  };

  // Function to handle dashboard redirection based on user role
  const handleBackToDashboard = () => {
    if (user.isAdmin) {
      navigate('/admin-dashboard'); // Redirect admin to admin dashboard
    } else {
      navigate('/user-home'); // Redirect normal user to user home
    }
  };

  // Function to modify profile picture URL (if using Cloudinary)
  const getCroppedImageUrl = (url) => {
    return url.replace('/upload/', '/upload/c_fill,w_150,h_150,g_face/');
  };

  return (
    <div className="view-profile-container" style={{ width: '900px', height: '800px', backgroundColor: '#f0f0f0' }}>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495', margin: '0px',marginBottom:'30PX', textAlign: 'center',letterSpacing: '1px' }}>
      Your Profile</p>
     

      {error && <p className="view-error-message">{error}</p>}

      <div className="view-profile-info view-centered-profile">
        <img
          src={
            user.profilePic
              ? getCroppedImageUrl(user.profilePic)
              : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          }
          alt="Profile"
          className="view-profile-pic"
        />
        <p className="view-profile-field">
  📛 <strong>Name:</strong> {user.name}
</p>
<p className="view-profile-field">
  📧 <strong>Email:</strong> {user.email}
</p>
<p className="view-profile-field">
  📍 <strong>Address:</strong> {user.address}
</p>
<p className="view-profile-field">
  📞 <strong>Phone:</strong> {user.phone}
</p>

      </div>

      <div className="view-profile-actions">
        <button
          className="view-action-btn"
          onClick={() => navigate('/profile')}
        >
          ✏️ Edit Profile
        </button>
        <button
          className="view-action-btn"
          onClick={() => navigate('/change-password')}
        >
          🔐 Change Password
        </button>
        <button
          className="view-action-btn"
          onClick={() => navigate('/delete-account')}
        >
          🗑️ Delete Account
        </button>
        
      
    
      </div>
      
      <button
          className="view-action-btn"
          style={{ marginTop: '20px',width: '600px' }}
          onClick={handleBackToDashboard}
        >
          ⬅ Back to Dashboard
        </button>
    </div>
  );
};


export default AdminProfile;
