import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminUser.css';
import Adminnaviagtion from "../Component/Adminnavigation";

const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const statusClassMap = {
  pending: 'status-pending',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  removed: 'status-removed',
  canceled: 'status-canceled',
  success: 'status-success',
};

const getEmoji = (rating) => {
  switch (rating) {
    case 1: return "😞";
    case 2: return "😐";
    case 3: return "🙂";
    case 4: return "😃";
    case 5: return "😍";
    default: return "";
  }
};

const AdminManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false); // ✅ new state
  const modalRef = useRef();

  useEffect(() => {
    verifyAdminAndFetchUsers();
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (!isDeleting) {
          setShowUserModal(false);
          setShowDeleteModal(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAdmins = admins.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.phone.toLowerCase().includes(term) ||
      (a.address && a.address.toLowerCase().includes(term))
    );
  });
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      (u.address && u.address.toLowerCase().includes(term))
    );
  });

  const verifyAdminAndFetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.isAdmin) {
        navigate('/login');
        return;
      }
      fetchUsers(token);
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUsers = res.data;
      setLoggedInUser(JSON.parse(localStorage.getItem('user')));
      setUsers(fetchedUsers.filter((u) => !u.isAdmin));
      setAdmins(fetchedUsers.filter((u) => u.isAdmin));
    } catch (err) {
      setError('❌ Failed to fetch users.');
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setDeletionReason('');
    setIsDeleting(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletionReason) {
      alert('❌ Please provide a reason for deleting the user.');
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { reason: deletionReason },
      });
      alert('✅ User successfully deleted');
      setUsers(users.filter((u) => u._id !== userToDelete));
      setShowDeleteModal(false);
      setDeletionReason('');
    } catch (err) {
      alert('❌ Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  const viewUserDetails = async (user) => {
    try {
      const [ordersRes, feedbacksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/api/feedback'),
      ]);
      const orderHistory = ordersRes.data.filter(o => o.user === user.email);
      const feedbackHistory = feedbacksRes.data.filter(fb => fb.userEmail === user.email);
      setSelectedUser({ ...user, orderHistory, feedbackHistory });
      setShowUserModal(true);
    } catch (err) {
      alert('❌ Error fetching user order or feedback details');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="maincontent">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Manage Users</p>
       
        <div className="summary">
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Total Admins: {admins.length}</p>

        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Total Users: {users.length} </p>
        
        </div>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, phone, address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="search-result-count">
            <p>
              🔍 {filteredAdmins.length + filteredUsers.length} result{(filteredAdmins.length + filteredUsers.length) !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Admins</p>
        
        <table className="standard-table">
          <thead>
            <tr><th>Profile</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th></tr>
          </thead>
          <tbody>
            {filteredAdmins.map(a => (
              <tr key={a._id}>
                <td><img src={a.profilePic || defaultProfilePicUrl} alt={a.name} className="user-profile-pic" /></td>
                <td>{a.name}</td><td>{a.email}</td><td>{a.phone}</td><td>{a.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

       
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Users</p>
        <table className="standard-table">
          <thead>
            <tr><th>Profile</th><th>Name&Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td ><img src={u.profilePic || defaultProfilePicUrl} alt={u.name} className="user-profile-pic" /></td>
                <td>{u.name}<br></br>{u.email}</td><td>{u.phone}</td><td>{u.address || '—'}</td>
                <td>
                  <button className="admin-user-btn" onClick={() => viewUserDetails(u)}>View</button>
                  <button className="admin-user-btn cancel" onClick={() => handleDeleteUser(u._id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showUserModal && selectedUser && (
          <div className="modal" >
            <div className="modal-content" ref={modalRef}>
              <span className="close" onClick={() => setShowUserModal(false)}>×</span>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
              User Details</p>
              
              <div className="user-info">
                <img style={{marginRight:"30px"}} src={selectedUser.profilePic || defaultProfilePicUrl} alt={selectedUser.name} className="user-profile-pic-large" />
                <div className="user-fields">
  <p><strong>Name:</strong> {selectedUser.name}</p>
  <p><strong>Email:</strong> {selectedUser.email}</p>
  <p><strong>Phone:</strong> {selectedUser.phone}</p>
  <p><strong>Address:</strong> {selectedUser.address || '—'}</p>

  {/* ✅ Only show this if personalPrayerWish exists */}
  {selectedUser.personalPrayerWish && (
    <p style={{ backgroundColor: '#fff6e6', padding: '5px', borderRadius: '6px', marginTop: '10px' }}>
      <strong>🙏 Prayer Wish:</strong> {selectedUser.personalPrayerWish}
    </p>
  )}
</div>

              </div>

             <p><br></br></p>   <p><br></br></p>
              
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
              Order History</p>
              
              <div className="order-history" style={{marginLeft:"60px"}}>
                {selectedUser.orderHistory.length > 0 ? selectedUser.orderHistory.map(order => {
                  const computedTotal = order.items.reduce((sum, it) => sum + it.finalPrice * it.quantity, 0);
                  const statusClass = statusClassMap[order.status.toLowerCase()] || '';
                  return (
                    <div style={{minWidth:"700px"}} className="order-card" key={order._id} >
                      <div className="order-header">
                        <span className="order-id">Order #{order._id}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <table className="items-table"  >
                        <thead><tr><th>Name</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i}>
                              <td>{item.name}</td>
                              <td>Rs.{item.finalPrice}</td>
                              <td>{item.quantity}</td>
                              <td>Rs.{item.finalPrice * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="order-footer">
                        <span className={`order-status ${statusClass}`}>Status: {order.status}</span>
                        <span className="order-final-total">Final Total: Rs.{computedTotal}</span>
                      </div>
                    </div>
                  );
                }) : <p className="no-orders" style={{marginLeft:"50px"}}>No orders found.</p>}
              </div>
              

              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
              Feedback History</p>
              <div className="order-history" style={{ marginLeft:"60px"}}>
                {selectedUser.feedbackHistory.length > 0 ? selectedUser.feedbackHistory.map(fb => (
                  <div style={{minWidth:"700px"}} className="order-card" key={fb._id}>
                    <div className="order-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '40px', fontWeight: 'bold' }}>
                        {Array.from({ length: fb.rating }, (_, i) => (
                          <span key={i} style={{ color: 'gold' }}>★</span>
                        ))}
                        <span>{getEmoji(fb.rating)}</span>
                      </div>
                      <span className="order-date">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="feedback-comment">"{fb.comment}"</p>
                    <p className="feedback-likes">
                      Likes: {fb.likes.length}
                      {fb.likes.length > 0 && (
                        <span>
                          (
                          {fb.likes.map((like, idx) => (
                            <span key={idx}>
                              <span style={{ color: like.includes('#admin') ? 'red' : 'black', fontWeight: 'bold' }}>
                                {like}
                              </span>
                              {idx < fb.likes.length - 1 && ', '}
                            </span>
                          ))}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                )) : <p className="no-orders" style={{marginLeft:"50px"}}>No feedback found.</p>}
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal">
            <div className="modal-content" ref={modalRef}>
              <span className="close" onClick={() => !isDeleting && setShowDeleteModal(false)}>×</span>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
              Confirm Remove</p>
             
              <textarea
                placeholder="Reason for deletion"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                disabled={isDeleting}
              />
              {isDeleting && (
                <p className="deleting-msg" style={{ color: 'red', fontWeight: 'bold' }}>
                  Removing user, please wait...
                </p>
              )}
              <div className="modal-actions">
                <button className="admin-user-btn" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? "Removing..." : "Confirm"}
                </button>
                <button
  className={`admin-user-btn cancel ${isDeleting ? 'disabled-btn' : ''}`}
  onClick={() => {
    if (!isDeleting) setShowDeleteModal(false);
  }}
  disabled={isDeleting}
>
  Cancel
</button>

              </div>
            </div>
          </div>
        )}

        <button className="go-back-btn" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminManageUsers;
