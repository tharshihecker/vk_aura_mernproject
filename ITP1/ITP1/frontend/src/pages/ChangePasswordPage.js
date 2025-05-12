// src/pages/ChangePasswordPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const [currentPassword,   setCurrentPassword]   = useState('');
  const [newPassword,       setNewPassword]       = useState('');
  const [confirmPassword,   setConfirmPassword]   = useState('');
  const [error,             setError]             = useState('');
  const [message,           setMessage]           = useState('');
  const [passwordCriteria,  setPasswordCriteria]  = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const validatePassword = (pw) => {
    setPasswordCriteria({
      length:     pw.length >= 8,
      number:     /\d/.test(pw),
      lowercase:  /[a-z]/.test(pw),
      uppercase:  /[A-Z]/.test(pw),
      specialChar:/[!@#$%^&*(),.?":{}|<>]/.test(pw),
    });
  };

  const handleNewPasswordChange = (e) => {
    const pw = e.target.value;
    setNewPassword(pw);
    validatePassword(pw);
  };

  const handleChangePassword = () => {
    setError(''); setMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('❌ All fields are required');
    }
    if (newPassword !== confirmPassword) {
      return setError('❌ Passwords do not match');
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      return setError('❌ Password does not meet all requirements');
    }

    const token = localStorage.getItem('token');
    axios.put(
      'http://localhost:5000/api/users/change-password',
      { currentPassword, newPassword, confirmPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setMessage('✅ Password updated successfully');
      setTimeout(() => navigate('/view-profile'), 2000);
    })
    .catch((err) => {
      setError('❌ ' + (err.response?.data?.message || 'Error updating password'));
    });
  };

  return (
    <div className="cpw-container">
      
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Change Password</p>

      {message && <p className="cpw-success">{message}</p>}
      {error   && <p className="cpw-error">{error}</p>}

      <input
        type="password"
        className="cpw-input"
        placeholder="Current Password"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        className="cpw-input"
        placeholder="New Password"
        value={newPassword}
        onChange={handleNewPasswordChange}
      />

      <div className="cpw-criteria">
        <p>{passwordCriteria.length     ? '✅' : '❌'} At least 8 characters</p>
        <p>{passwordCriteria.number     ? '✅' : '❌'} At least 1 number</p>
        <p>{passwordCriteria.lowercase  ? '✅' : '❌'} At least 1 lowercase letter</p>
        <p>{passwordCriteria.uppercase  ? '✅' : '❌'} At least 1 uppercase letter</p>
        <p>{passwordCriteria.specialChar? '✅' : '❌'} At least 1 special symbol</p>
      </div>

      <input
        type="password"
        className="cpw-input"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />

      <div className="cpw-button-group">
        <button
          className="cpw-btn cpw-save-btn"
          onClick={handleChangePassword}
        >
          ✅Update Password
        </button>
        <button
          className="cpw-btn cpw-cancel-btn"
          onClick={() => navigate('/view-profile')}
        >
          ❌Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
