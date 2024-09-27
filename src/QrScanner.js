import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import './QrScanner.css';

const QrScanner = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scannedQRCode, setScannedQRCode] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          setScannedQRCode(code.data);
          alert(`QR Code scanned: ${code.data}`);
          handleSearchByQRCode(code.data); // Automatically search by scanned QR code
        } else {
          setError('No QR code found in the image.');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSearchByQRCode = async (qrCode) => {
    try {
      const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-find-guest-by-email', {
        qrCode,
      });
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
  };

  const handleEmailSearch = async () => {
    try {
      const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-find-guest-by-email', {
        email,
      });
      console.log('API Response:', response.data);

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
      console.log('Searching for guest by email:', email); // Check if function is called

      try {
        const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-mark-guest-as-present', {
          guestId: searchResult.id, // Assuming the response contains the guest ID
        });

        if (response.status === 200) {
          const isPresent = response.data.present; // This is the boolean returned from your API
          setGuestInfo(`Guest ${searchResult.name} marked as present.`);

          // Update the search result to reflect the present status
          setSearchResult(prev => ({
            ...prev,
            present: isPresent, // Update the present status
          }));

          setEmail(''); // Clear email input
          setError(null);
        }
      } catch (err) {
        console.error('Error marking guest as present:', err);
        setError('Failed to mark guest as present.');
      }
    }
  };

  return (
    <div className="qr-scanner">
      <h2>QR Scanner</h2>
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // Suggest using the rear camera
          onChange={handleFileUpload} 
        />
        {selectedFile && <p>Uploaded File: {selectedFile.name}</p>}
      </div>
  
      {scannedQRCode && <p>Scanned QR Code: {scannedQRCode}</p>}
  
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
        <div className="search-result" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                <td>{searchResult.present ? 'Present' : 'Not Present'}</td>
                <td>
                  <button onClick={markGuestPresentByEmail}>
                    Mark Present
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
  
      {guestInfo && <p>{guestInfo}</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default QrScanner;
