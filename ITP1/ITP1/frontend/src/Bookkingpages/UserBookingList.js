import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; 
import UserComponent from "../Component/Usercomponent";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from "react-icons/fa";
import "./OrderHistory.css";

const UserBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    if (!user) {
      setError('Please log in to view your bookings.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/user');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, user]);

  const cancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data.error || 'Error cancelling booking.');
    }
  };

  const handleCancelConfirmation = (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?\n❗Your request cannot be undone.");
    if (!confirmCancel) return;
  
    cancelBooking(id); 
  };



  const filteredBookings = bookings
  .filter((booking) => {
    const search = searchQuery.toLowerCase();
    const dateMatch = new Date(booking.date).toLocaleDateString().includes(search);
    const statusMatch = booking.status.toLowerCase().includes(search);
    const priestMatch = booking.priest?.name?.toLowerCase().includes(search);
    const eventMatch = booking.event?.toLowerCase().includes(search);
    return dateMatch || statusMatch || priestMatch || eventMatch;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date)); // ← this line sorts by date descending


  if (authLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view your bookings.</p>;

  return (
    <div>
      <UserComponent user={user} />
      <p><br /></p>

      <div className="order-history-container" style={{ marginLeft: "180px" }}>
        <p className="OrderHis">📦 Your Bookings</p>
        <br />
        <input
          type="text"
          className="search-bar"
          placeholder="Search by event, priest, date, or status... 🔍"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading && <p>Loading bookings...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && filteredBookings.length === 0 && <p>No bookings found.</p>}

        <div className="order-grid">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="order-card">
              <h3>📅 Date: {new Date(booking.date).toLocaleDateString()}</h3>
              <p><strong>Event:</strong> {booking.event}</p>
              <p><strong>Priest:</strong> {booking.priest?.name || 'Not assigned'}</p>
              <p><strong>Status:</strong> 
                <span style={{ color: booking.status === 'Booked' ? '#28a745' : '#888', fontWeight: 'bold' }}>
                  {' '}{booking.status}
                </span>
              </p>
              {booking.status === 'Booked' && new Date(booking.date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) && (
  <div className="order-actions">
    <button onClick={() => handleCancelConfirmation(booking._id)}>❌ Cancel</button>
  </div>
)}


            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
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

export default UserBookingList;
