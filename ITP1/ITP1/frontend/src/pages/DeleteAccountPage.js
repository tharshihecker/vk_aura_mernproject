// src/pages/DeleteAccountPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/DeleteAccountPage.css';

const DeleteAccountPage = () => {
  const [deletePassword, setDeletePassword] = useState('');
  const [error,          setError]          = useState('');
  const [message,        setMessage]        = useState('');
  const [isDeleting,     setIsDeleting]     = useState(false); // ✅ NEW
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setError('❌ Please enter your password to confirm deletion');
      setMessage('');
      return;
    }
  
    setIsDeleting(true); // ✅ Only runs after validation
    setError('');
    setMessage('');
  
    const token = localStorage.getItem('token');
    axios
      .delete('http://localhost:5000/api/users/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
      })
      .then(() => {
        setMessage('✅ Account deleted successfully');
        localStorage.removeItem('token');
        setIsDeleting(false);
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(err => {
        setError('❌ ' + (err.response?.data?.message || 'Error deleting account'));
        setIsDeleting(false);
      });
  };
  
  return (
    <div className="dap-container">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495', margin: '0px', marginBottom: '30px', textAlign: 'center', letterSpacing: '1px' }}>
        Delete Account
      </p>

      {message && <p className="dap-success">{message}</p>}
      {error   && <p className="dap-error">{error}</p>}
      {isDeleting && (
        <p style={{ textAlign: 'center', fontWeight: 'bold', color: 'red',fontSize: '19px' }}>
          Deleting account... please wait
        </p>
      )}

      <input
        type="password"
        className="dap-input"
        placeholder="Confirm Password to Delete"
        value={deletePassword}
        onChange={e => setDeletePassword(e.target.value)}
        disabled={isDeleting} // ✅ disable input during deletion
      />

      <div className="dap-button-group">
        <button
          className="dap-btn dap-delete-btn"
          onClick={handleDeleteAccount}
          disabled={isDeleting} // ✅ disable during deletion
        >
          {isDeleting ? 'Removing...' : '✅Delete Account'}
        </button>
        <button
          className="dap-btn dap-cancel-btn"
          onClick={() => navigate('/view-profile')}
          disabled={isDeleting} // ✅ disable during deletion
        >
          ❌Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
