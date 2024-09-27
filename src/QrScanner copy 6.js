import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './QrScanner.css';
import { API_FIND_GUEST_BY_EMAIL } from "./endpoints.js";
import QrScanner from 'react-qr-scanner';

const QRScannerComponent = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const handleScan = async (data) => {
    if (data) {
      setEmail(data); // Populate the email input with the scanned QR code
      displayAlert(`QR Code scanned: ${data}`);
      await handleSearchByQRCode(data);
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError('Could not read QR code.');
  };

  const displayAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
  };

  const handleSearchByQRCode = useCallback(async (qrCode) => {
    if (!qrCode) return;

    try {
      const response = await axios.post(API_FIND_GUEST_BY_EMAIL, { qrCode });
      if (response.status === 200 && response.data) {
        setSearchResult(response.data);
        setError(null);
      } else {
        setError('Guest not found.');
      }
    } catch (err) {
      console.error('Error searching guest by QR code:', err);
      setError('Failed to search guest.');
    }
  }, []);

  const handleEmailSearch = async () => {
    try {
      const response = await axios.post(API_FIND_GUEST_BY_EMAIL, { email });
      if (response.status === 200 && response.data) {
        setSearchResult(response.data);
        setError(null);
      } else {
        setError('Guest not found.');
      }
    } catch (err) {
      console.error('Error searching guest by email:', err);
      setError('Failed to search guest.');
    }
  };

  const markGuestPresentByEmail = async () => {
    if (searchResult) {
      try {
        const response = await axios.post(`YOUR_API_ENDPOINT_TO_MARK_GUEST_PRESENT`, {
          email: searchResult.email
        });
        if (response.status === 200) {
          setGuestInfo(`Guest ${searchResult.name} marked as present.`);
          setEmail('');
          setSearchResult(null);
        } else {
          setGuestInfo('Error marking guest as present.');
        }
      } catch (err) {
        console.error('Error marking guest as present:', err);
        setError('Error marking guest as present.');
      }
    }
  };

  return (
    <div className="qr-scanner">
      <h2>QR Scanner</h2>
      <QrScanner
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      
      {alertMessage && <p className="alert">{alertMessage}</p>}
      
      <div className="email-search">
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter guest email" 
        />
        <button onClick={handleEmailSearch}>Search Guest</button>
      </div>

      {searchResult && (
        <div className="search-result">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Table Number</th>
                <th>Present</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{searchResult.name}</td>
                <td>{searchResult.email}</td>
                <td>{searchResult.tableNumber}</td>
                <td>{searchResult.present ? 'Yes' : 'No'}</td>
                <td>
                  <button 
                    onClick={markGuestPresentByEmail} 
                    disabled={searchResult.present}
                  >
                    Mark as Present
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {guestInfo && <p className="info">{guestInfo}</p>}
    </div>
  );
};

export default QRScannerComponent;
