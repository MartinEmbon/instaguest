import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./ListGuests.css"
const ListGuests = () => {
  const [guests, setGuests] = useState([]);
  const [event, setEvent] = useState(''); // Track the selected event
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGuestsByEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-retrieve-guest-list?event=${event}`);
      if (response.data.guests) {
        setGuests(response.data.guests);
      } else {
        setError('No guests found for this event.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to load guests.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event) {
      fetchGuestsByEvent();
    }
  }, [event]);

  const handleEventChange = (e) => {
    setEvent(e.target.value);
  };

  return (
    <div className="guest-list">
      <h2>Guest List by Event</h2>
      <div>
        <label>Select Event: </label>
        <input type="text" value={event} onChange={handleEventChange} placeholder="Enter event name" />
      </div>

      {loading && <p>Loading guests...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {guests.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Table Number</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td>{guest.name}</td>
                <td>{guest.email}</td>
                <td>{guest.tableNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListGuests;
