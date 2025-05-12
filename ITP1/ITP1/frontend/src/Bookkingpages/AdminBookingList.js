import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnaviagtion from "../Component/Adminnavigation";

const AdminBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriest, setSelectedPriest] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = [...bookings];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter(
      booking => new Date(booking.date).getTime() > today.getTime()
    );

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.priest &&
        booking.priest.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPriest) {
      filtered = filtered.filter(
        booking => booking.priest && booking.priest._id === selectedPriest
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        booking =>
          new Date(booking.date).toLocaleDateString() ===
          new Date(selectedDate).toLocaleDateString()
      );
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredBookings(filtered);
  }, [bookings, searchQuery, selectedPriest, selectedDate]);

  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data.error || 'Error cancelling booking');
    }
  };

  const priestOptions = bookings
    .map(booking => booking.priest)
    .filter(priest => priest !== null)
    .reduce((unique, priest) => {
      if (!unique.some(item => item._id === priest._id)) {
        unique.push(priest);
      }
      return unique;
    }, []);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', color: '#000' ,marginLeft: '150px'}}>
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p> 
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Admin - Booking Details </p> 
       

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div style={{ flex: '1 1 30%' }}>
            <label style={{ fontWeight: 'bold' }}>Search Priest by Name:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ flex: '1 1 30%' }}>
            <label style={{ fontWeight: 'bold' }}>Select Priest:</label>
            <select
              value={selectedPriest}
              onChange={(e) => setSelectedPriest(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value="">-- All Priests --</option>
              {priestOptions.map(priest => (
                <option key={priest._id} value={priest._id}>{priest.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 30%' }} >
            <label style={{ fontWeight: 'bold' }}>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
            />
          </div>
        </div>

        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <h3 style={{ marginBottom: '20px' }}>Booking Details</h3>
          {filteredBookings.length === 0 ? (
            <p>No bookings found for this filter.</p>
          ) : (
            filteredBookings.map(booking => (
              <div
                key={booking._id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9',
                  minHeight: '150px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px' }}>{booking.event}</h4>
                  <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                  <p><strong>Priest:</strong> {booking.priest ? booking.priest.name : 'N/A'}</p>
                  <p><strong>Status:</strong> {booking.status}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {booking.status === 'Booked' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingList;
