// src/pages/AdminDeletedUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDeletedUser.css';
import Adminnaviagtion from "../Component/Adminnavigation"; 

const AdminDeletedUsers = () => {
  const navigate = useNavigate();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    verifyAdminAndFetchDeletedUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(deletedUsers);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = deletedUsers.filter(user => {
      const dateMatch = new Date(user.deletedAt).toLocaleDateString().toLowerCase().includes(lowerSearch);
      const monthMatch = new Date(user.deletedAt).toLocaleString('default', { month: 'long' }).toLowerCase().includes(lowerSearch);

      return (
        user.name?.toLowerCase().includes(lowerSearch) ||
        user.email?.toLowerCase().includes(lowerSearch) ||
        user.phone?.toLowerCase().includes(lowerSearch) ||
        user.address?.toLowerCase().includes(lowerSearch) ||
        user.reason?.toLowerCase().includes(lowerSearch) ||
        dateMatch ||
        monthMatch
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, deletedUsers]);

  const verifyAdminAndFetchDeletedUsers = async () => {
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

      fetchDeletedUsers(token);
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchDeletedUsers = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/deleted-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      setError('❌ Failed to fetch deleted users.');
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
          Removed Users
        </p>

        {/* Search Input */}
        <div className="admin-summary-search-box">
          <input
            type="text"
            placeholder="Search by name, email, phone, address, reason or month"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-summary-search-input"
          />
          {searchTerm && (
            <p className="search-count">
              🔍 {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {error && <p>{error}</p>}

        <table className="admin-summary-user-table">
          <thead>
            <tr>
              <th>Pic</th>
              <th>Name</th>
              <th>Email & Phone</th>
              <th>Address</th>
              <th>Reason</th>
              <th>Removed At</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className='remove-prof'>
                  <img
                    src={user.profilePic || "/default-avatar.png"}
                    alt="Profile"
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                  />
                </td>
                <td className='remove-name'>{user.name}</td>
                <td className='remove-email-phone'>{user.email}<br /> {user.phone}</td>
                <td className='remove-user-address' >{user.address || 'No address available'}</td>
                <td className='resonR' style={{ color: 'red', fontWeight: 'bold' }}>{user.reason}</td>
                <td className='removedate'>{new Date(user.deletedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDeletedUsers;
