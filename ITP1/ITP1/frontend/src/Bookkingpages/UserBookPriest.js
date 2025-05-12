import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import UserComponent from "../Component/Usercomponent";

const UserBookPriest = () => {
  const [event, setEvent] = useState('');
  const [date, setDate] = useState('');
  const [availablePriests, setAvailablePriests] = useState([]);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const API_BASE_URL = 'http://localhost:5000';

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 60);
    return today.toISOString().split('T')[0];
  };

  const fetchAvailablePriests = async () => {
    if (!date) {
      setError('Please select a date first!');
      return;
    }

    const minDate = new Date(getMinDate());
    const maxDate = new Date(getMaxDate());
    const selectedDate = new Date(date);

    if (selectedDate < minDate || selectedDate > maxDate) {
      setError('The selected date must be between 7 and 60 days from today.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/priests/available?date=${date}`);
      setAvailablePriests(response.data);
      setAvailabilityChecked(true);
      setError('');
    } catch (error) {
      console.error('Error fetching available priests', error);
      setError('Failed to fetch available priests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!event || event.length <= 5) {
      setError('Event name must be more than 5 characters (no numbers or symbols).');
      return;
    }
    
    
    
    if (!date || !selectedPriest) {
      setError('Please complete all fields: Event, Date, and Priest selection.');
      return;
    }
    if (!user) {
      setError('You need to be logged in to book a priest.');
      return;
    }
  
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        priestId: selectedPriest,
        event,
        date,
      });
      alert('Priest booked successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error booking priest:', error.response?.data || error.message);
      if (error.response) {
        setError(`Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please check the backend.');
      } else {
        setError('An error occurred while making the request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to book a priest.</p>;

  return (

    <div>

    <UserComponent user={user} />
    <p><br></br></p> <p><br></br></p>
    
    <div
      className="user-book-priest-container"
      style={{
        backgroundColor: "rgba(255, 250, 250, 0.8)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Book a Priest</p> 
     
      <form onSubmit={handleSubmit}>


      
      <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
  <label style={{ fontWeight: "bold", marginRight: "10px" }}>Event:</label>
  <select
    value={event}
    onChange={(e) => setEvent(e.target.value)}
    required
    style={{
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      flex: "1",
      maxWidth: "250px"
    }}
  >
    <option value="">-- Select an Event --</option>
    <option value="Wedding">Wedding</option>
    <option value="Housewarming (Griha Pravesh)">Housewarming (Griha Pravesh)</option>
    <option value="Ganesha Pooja">Ganesha Pooja</option>
    <option value="Sathyanarayana Pooja">Sathyanarayana Pooja</option>
    <option value="Durga Pooja">Durga Pooja</option>
    <option value="Naming Ceremony (Namakarana)">Naming Ceremony (Namakarana)</option>
    <option value="Thread Ceremony (Upanayana)">Thread Ceremony (Upanayana)</option>
    <option value="Shraddha Ceremony">Shraddha Ceremony</option>
    <option value="Annaprashana (First Rice Ceremony)">Annaprashana (First Rice Ceremony)</option>
    <option value="Karthigai Deepam">Karthigai Deepam</option>
    <option value="Ayudha Pooja">Ayudha Pooja</option>
    <option value="Other">Other</option>
  </select>
</div>



<div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
  <label style={{ fontWeight: "bold", marginRight: "10px" }}>Date:</label>
  <input
    type="date"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    min={getMinDate()}
    max={getMaxDate()}
    required
    style={{
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      flex: "1",
      maxWidth: "250px"
    }}
  />
</div>



        <button type="button" onClick={fetchAvailablePriests} disabled={loading} style={{width:"100%"}}>
          {loading ? 'Loading...' : 'Check Availability'}
        </button>

        {availabilityChecked && availablePriests.length === 0 && (
          <p>No priest available for the selected date.</p>
        )}

        {availablePriests.length > 0 && (
          
          <div>
            <h3>Available Priests</h3>
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Daily Charge</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {availablePriests.map((priest) => (
                  <tr key={priest._id}>
                    <td>
                      <img
                        src={`http://localhost:5000${priest.photo}`}
                        alt={priest.name}
                        width="50"
                      />
                    </td>
                    <td>{priest.name}</td>
                    <td>${priest.dailyCharge}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedPriest(priest._id)}
                        style={{
                          backgroundColor: selectedPriest === priest._id ? 'green' : '',
                          color: 'white',
                        }}
                      >
                        {selectedPriest === priest._id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" disabled={loading || !selectedPriest}>
              {loading ? 'Booking...' : 'Book Priest'}
            </button>
          </div>
        )}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Back Button with Corrected Navigation */}
      <button
        className="back-button"
        onClick={() => navigate('/user-home')} // Corrected navigate function
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px', // Adjusted spacing
        }}
      >
        ⬅ Back to Home
      </button>
    </div>
    </div>
  );
};

export default UserBookPriest;
