import React, { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";
import "./AddGuest.css"


const AddGuest = () => {
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    tableNumber: "",
    event: "", // New field for the event
  });
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setGuestInfo({
      ...guestInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Add guest data to the backend
      const response = await axios.post("https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-send-email", guestInfo);
      const guestId = response.data.id; // Use the response to get the ID
      
      const qrCodeData = `${guestId}`;
      setQrCodeValue(qrCodeData);
      setLoading(false);
    } catch (error) {
      console.error("Error saving guest data:", error);
      
    // Check if the error response is a 404 (Event not found)
    if (error.response && error.response.status === 404) {
      setError("The event does not exist. Please check the event ID and try again.");
    } else {
      setError("Failed to save guest information. Please try again.");
    }
      setLoading(false);
    }
  };

  return (
    <div className="guest-form">
      <h2>Add Guest Information</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={guestInfo.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={guestInfo.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Table Number:</label>
          <input
            type="number"
            name="tableNumber"
            value={guestInfo.tableNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Event:</label> {/* New field for selecting the event */}
          <input
            type="text"
            name="event"
            value={guestInfo.event}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save & Generate QR Code"}
        </button>
      </form>

      {qrCodeValue && (
        <div className="qr-code-section">
          <h3>Guest QR Code:</h3>
          <QRCode
            value={qrCodeValue}
            size={256}
            logoImage="path/to/logo.png"
          />
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddGuest;
