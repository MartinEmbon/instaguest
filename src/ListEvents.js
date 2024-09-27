import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation

import axios from 'axios';
import "./ListEvents.css"; // Optional: create a CSS file for styling

const ListEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const navigate = useNavigate(); // Hook for navigation

  const handleCreateEvent = () => {
    navigate('/create-event'); // Redirect to the create event page
  };

  const handleRefresh = () => {
    fetchEvents(); // Refresh the event list
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-guet-events-collection'); // Replace with your endpoint
      console.log('API Response:', response.data);
  
      if (response.data.events) {
        setEvents(response.data.events);
      } else {
        setError('No events found.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="event-list">
      <h2>List of Events</h2>
      <div className="buttons">
        <button onClick={handleCreateEvent}>Create Event</button> {/* Button to redirect to create event */}
        <button onClick={handleRefresh}>Refresh</button> {/* Button to refresh the event list */}
      </div>
      {loading && <p>Loading events...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {events.length > 0 && (
       
   
       <div class="table-container">
         <table>
           <thead>
             <tr>
               <th>Event ID</th>
               <th>Event Name</th>
               <th>Owner</th>
               <th>Location</th>
               <th>Date</th>
               <th>Number of Guests</th>
               <th>Observations</th>
             </tr>
           </thead>
           <tbody>
             {events.map((event) => (
               <tr key={event.eventId}>
                 <td>{event.eventId}</td>
                 <td>{event.eventName || "N/A"}</td>
                 <td>{event.owner || "N/A"}</td> {/* Display "N/A" if owner is not available */}
                 <td>{event.location || "N/A"}</td> {/* Display "N/A" if location is not available */}
                 <td>{event.date}</td>
                 <td>{event.guestCount}</td>
                 <td>{event.observation || "N/A"}</td> {/* Display "N/A" if observation is not available */}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
      )}
    </div>
  );
};

export default ListEvents;
