import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import './QrScanner.css';
import { API_FIND_GUEST_BY_EMAIL } from "./endpoints.js";

const QrScanner = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scannedQRCode, setScannedQRCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [scanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      requestAnimationFrame(scanQRCode);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const displayAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
  };

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (videoRef.current) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && scannedQRCode !== code.data) {
        setScannedQRCode(code.data);
        setEmail(code.data); // Populate the email input with the scanned QR code
        displayAlert(`QR Code scanned: ${code.data}`);
        handleSearchByQRCode(code.data);
        setScanning(false); // Stop scanning after successful scan
      }
    }

    requestAnimationFrame(scanQRCode);
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
          setEmail(code.data); // Populate the email input with the scanned QR code
          displayAlert(`QR Code scanned: ${code.data}`);
        } else {
          setError('No QR code found in the image.');
        }
      };
    };
    reader.readAsDataURL(file);
  };

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
      <video ref={videoRef} style={{ width: '100%', display: scanning ? 'block' : 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
      <button onClick={() => setScanning(prev => !prev)}>
        {scanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        {selectedFile && <p>Uploaded File: {selectedFile.name}</p>}
      </div>

      {scannedQRCode && <p>Scanned QR Code: {scannedQRCode}</p>}
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

export default QrScanner;
