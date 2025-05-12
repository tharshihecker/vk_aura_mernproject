import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Adminnaviagtion from "../Component/Adminnavigation";
import "react-datepicker/dist/react-datepicker.css";

const AdminAddPriest = () => {
  const [name, setName] = useState('');
  const [dailyCharge, setDailyCharge] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);

  const handleDateChange = (date) => {
    const exists = unavailableDates.some(d => d.getTime() === date.getTime());
    if (exists) {
      setUnavailableDates(unavailableDates.filter(d => d.getTime() !== date.getTime()));
    } else {
      setUnavailableDates([...unavailableDates, date]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare form data to send
    const formData = new FormData();
    formData.append('name', name);
    formData.append('dailyCharge', dailyCharge);

    // If there is a photo selected, append it to the form data
    if (photoFile) {
      formData.append('photoFile', photoFile);
    }
    
    // Append unavailable dates to the form data
    formData.append('unavailableDates', JSON.stringify(unavailableDates));

    try {
      // Send POST request without manually setting Content-Type
      await axios.post('http://localhost:5000/api/priests', formData);

      alert('Priest added successfully');
      window.location.reload();
    } catch (error) {
      console.error("Error details:", error.response.data); // Log the error response from the server
      alert('Error adding priest');
    }
  };


  const photoPreview = photoFile ? URL.createObjectURL(photoFile) : null;

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>
      <div className="main-content">
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
      Add Priest </p> 
       
        <form onSubmit={handleSubmit} className="priest-form">
          <div className="input-group">
            <label>Name:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Daily Charge:</label>
            <input type="number" value={dailyCharge} onChange={e => setDailyCharge(e.target.value)} required />
          </div>
          <div className="photo-date-row">
            <div className="photo-section">
              <label>Browse Photo:</label>
              <input type="file" onChange={handleFileChange} />
              {photoPreview && <img src={photoPreview} alt="Photo Preview" className="photo-preview" />}
            </div>
            <div className="date-section"  style={{color: '#374495'}} >
              <label>Unavailable Dates:</label>
              <DatePicker 
                selected={null}
                onChange={handleDateChange}
                inline
                highlightDates={unavailableDates}
                dayClassName={date => unavailableDates.some(d => d.getTime() === date.getTime()) ? 'selected-date' : ''}
                minDate={new Date()}
              />
            </div>
          </div>
          <button type="submit">Add Priest</button>
        </form>
        <style>
          {`
            .priest-form {
              max-width: 600px;
              margin: auto;
            }
            .photo-date-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 20px;
            }
            .photo-section, .date-section {
              width: 48%;
            }
            .selected-date {
              background-color: green !important;
              color: white !important;
            }
            .input-group {
              margin-bottom: 15px;
            }
            label {
              font-weight: bold;
              display: block;
              margin-bottom: 5px;
            }
            input {
              width: 100%;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
            button {
              background-color:#1E88E5;
              color: white;
              padding: 10px 15px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 10px;
            }
            button:hover {
              background-color:#1E88E5;
            }
            .photo-preview {
              margin-top: 10px;
              max-width: 100%;
              height: auto;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminAddPriest;
