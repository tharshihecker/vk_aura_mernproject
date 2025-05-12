import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const AdminPriestList = () => {
  const [priests, setPriests] = useState([]);
  const [editingPriest, setEditingPriest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dailyCharge: '',
    photoFile: null,
    unavailableDates: []
  });

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/priests');
      const filteredPriests = res.data.map(priest => ({
        ...priest,
        unavailableDates: priest.unavailableDates.filter(date => new Date(date) >= new Date())
      }));
      setPriests(filteredPriests);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (priest) => {
    setEditingPriest(priest._id);
    setFormData({
      name: priest.name,
      dailyCharge: priest.dailyCharge,
      photoFile: null,
      unavailableDates: priest.unavailableDates ? priest.unavailableDates.map(date => new Date(date)) : []
    });
  };

  const handleDateChange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      alert("You cannot select dates in the past.");
      return;
    }

    const exists = formData.unavailableDates.some(d => d.getTime() === date.getTime());
    if (exists) {
      setFormData({
        ...formData,
        unavailableDates: formData.unavailableDates.filter(d => d.getTime() !== date.getTime())
      });
    } else {
      setFormData({
        ...formData,
        unavailableDates: [...formData.unavailableDates, date]
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photoFile: e.target.files[0] });
  };

  const handleUpdate = async (id) => {
    const updateData = new FormData();
    updateData.append('name', formData.name);
    updateData.append('dailyCharge', formData.dailyCharge);
    if (formData.photoFile) {
      updateData.append('photoFile', formData.photoFile);
    }
    updateData.append('unavailableDates', JSON.stringify(formData.unavailableDates));

    try {
      await axios.put(`http://localhost:5000/api/priests/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Priest updated successfully');
      setEditingPriest(null);
      fetchPriests();
    } catch (error) {
      console.error(error);
      alert('Error updating priest');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/priests/${id}`);
      alert('Priest deleted successfully');
      fetchPriests();
    } catch (error) {
      console.error(error);
      alert('Error deleting priest');
    }
  };

  const photoPreview = formData.photoFile ? URL.createObjectURL(formData.photoFile) : null;

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh' }}>
      <Adminnaviagtion />
      <p><br></br></p>  <p><br></br></p>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495',  margin: '20px 0', textAlign: 'center',letterSpacing: '1px' }}>
        Priest List</p>
        {priests.map(priest => (
          <div key={priest._id} style={{
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#f9f9f9',
           
          }}>
            {editingPriest === priest._id ? (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold' }}>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold' }}>Daily Charge:</label>
                  <input
                    type="number"
                    value={formData.dailyCharge}
                    onChange={e => setFormData({ ...formData, dailyCharge: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold' }}>Change Photo:</label>
                  <input type="file" onChange={handleFileChange} />
                  {photoPreview && <img src={photoPreview} alt="Preview" style={{ marginTop: '10px', width: '500px',height:"500px" ,borderRadius: '5px' }} />}
                  {!photoPreview && priest.photo && (
                    <div style={{ marginTop: '10px' }}>
                      <p>Current Photo:</p>
                      <img src={`http://localhost:5000${priest.photo}`} alt="Current" style={{ width: '500px', borderRadius: '5px' }} />
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold' }}>Unavailable Dates:</label>
                  <DatePicker
                    selected={null}
                    onChange={handleDateChange}
                    inline
                    highlightDates={formData.unavailableDates}
                    dayClassName={date =>
                      formData.unavailableDates.some(d => d.getTime() === date.getTime()) ? 'selected-date' : ''
                    }
                    minDate={new Date()}
                  />
                </div>
                <div style={{ marginTop: '20px' }}>
                  <button onClick={() => handleUpdate(priest._id)} style={{
                    backgroundColor: '#007bff',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    marginRight: '10px',
                    width:"47%",
                    cursor: 'pointer'
                  }}>Save</button>
                  <button onClick={() => setEditingPriest(null)} style={{
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    width:"47%",
                    cursor: 'pointer'
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                <img src={`http://localhost:5000${priest.photo}`} alt={priest.name} style={{ width: '300px',height:"200px" ,borderRadius: '5px' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>{priest.name}</h3>
                  <p><strong>Daily Charge:</strong> ${priest.dailyCharge}</p>
                  <p><strong>Unavailable Dates:</strong><br /> {priest.unavailableDates.map(date => new Date(date).toLocaleDateString()).join(', ')}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => handleEditClick(priest)} style={{
                      backgroundColor: '#ffc107',
                      color: '#000',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '5px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}>Edit</button>
                    <button onClick={() => handleDelete(priest._id)} style={{
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <style>
          {`
            .selected-date {
              background-color: green !important;
              color: white !important;
              border-radius: 50%;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminPriestList;
