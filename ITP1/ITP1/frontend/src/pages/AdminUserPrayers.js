import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUser.css';
import Adminnaviagtion from "../Component/Adminnavigation";

const AdminUserPrayers = () => {
  const [usersWithPrayers, setUsersWithPrayers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const modalRef = useRef();
  const navigate = useNavigate();

  const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

  useEffect(() => {
    verifyAdminAndFetchUsers();

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (!sending) setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const verifyAdminAndFetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.data.isAdmin) return navigate('/login');
      fetchUsers(token);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = res.data.filter(u => u.personalPrayerWish?.trim());
      setUsersWithPrayers(filtered);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setMessage('');
    setStatusMsg('');
    setShowModal(true);
  };

  const sendBlessing = async () => {
    if (!message.trim()) return alert('Please type your blessing message.');
    setSending(true);
    setStatusMsg('📨 Sending...');

    try {
      await axios.post(
        'http://localhost:5000/api/admin/send-prayer-email',
        { userId: selectedUser._id, message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setStatusMsg('✅ Blessing email sent successfully!');
      const token = localStorage.getItem('token');
      if (token) fetchUsers(token);
    } catch (err) {
      console.error(err);
      setStatusMsg('❌ Failed to send email.');
    } finally {
      setSending(false);
      setTimeout(() => {
        setShowModal(false);
        setStatusMsg('');
      }, 2000);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="maincontent">
      <p style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#374495',
          margin: '0px',
          marginBottom: '30px',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          User Prayers
        </p>
        <table className="standard-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Prayer Wish</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {usersWithPrayers.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999', fontStyle: 'italic' }}>
        🕊️ No users have submitted a prayer wish yet.
      </td>
    </tr>
  ) : (
    usersWithPrayers.map(user => (
      <tr key={user._id}>
        <td>
          <img src={user.profilePic || defaultProfilePicUrl} alt="profile" width="40" height="40" style={{ borderRadius: '50%' }} />
        </td>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.phone}</td>
        <td>{user.personalPrayerWish}</td>
        <td>
          <button className="admin-user-btn" onClick={() => openModal(user)}>
            ✉️ Send Blessing
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>

        {showModal && selectedUser && (
          <div className="modal">
            <div className="modal-content" ref={modalRef}>
              <span className="close" onClick={() => !sending && setShowModal(false)}>×</span>
  <p style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#374495',
          margin: '0px',
          marginBottom: '30px',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
         Send Blessing to {selectedUser.name}
        </p>
              <textarea
                placeholder="Type your blessing message here..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
              {statusMsg && (
                <p className="status-text" style={{ marginTop: '10px', textAlign: 'center', fontWeight: 'bold', color: statusMsg.startsWith('✅') ? '#4CAF50' : '#e53935' }}>
                  {statusMsg}
                </p>
              )}
              <div className="modal-actions">
                <button className="admin-user-btn" onClick={sendBlessing} disabled={sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
                <button className="admin-user-btn cancel" onClick={() => setShowModal(false)} disabled={sending}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default AdminUserPrayers;
