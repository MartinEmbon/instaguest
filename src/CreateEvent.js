import React, { useState } from 'react';
import axios from 'axios';
import './CreateEvent.css'; // Optional: Create a CSS file for styling

const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [owner, setOwner] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [observation, setObservation] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const newEvent = {
      eventName,
      owner,
      location,
      guestCount,
      observation,
      date
    };

    try {
      const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-create-event', newEvent);
      if (response.status === 200) {
        setSuccessMessage('Event created successfully!');
        // Optionally, clear the form fields
        setEventName('');
        setOwner('');
        setLocation('');
        setGuestCount('');
        setObservation('');
        setDate('');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrorMessage('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="create-event">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Name:</label>
          <input 
            type="text" 
            value={eventName} 
            onChange={(e) => setEventName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Owner:</label>
          <input 
            type="text" 
            value={owner} 
            onChange={(e) => setOwner(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Location:</label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Guest Count:</label>
          <input 
            type="number" 
            value={guestCount} 
            onChange={(e) => setGuestCount(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Observations:</label>
          <textarea 
            value={observation} 
            onChange={(e) => setObservation(e.target.value)} 
          />
        </div>
        <div>
          <label>Event Date:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Create Event</button>
      </form>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default CreateEvent;
