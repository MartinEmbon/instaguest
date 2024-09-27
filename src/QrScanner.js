import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import './QrScanner.css';

const QrScanner = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [manualInput, setManualInput] = useState(false);
  const [scanning, setScanning] = useState(false); // State to control scanning
  const [cameraStarted, setCameraStarted] = useState(false); // State to track camera status

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStarted(true); // Mark camera as started
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  useEffect(() => {
    const scanQRCode = () => {
      if (!scanning || !cameraStarted) return; // Only scan if scanning is true and camera has started

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          alert(`QR Code scanned: ${code.data}`);
          // Here you could mark the guest as present or handle the QR code data
        }
      }
    };

    const interval = setInterval(scanQRCode, 1000); // Scan every second

    return () => clearInterval(interval);
  }, [scanning, cameraStarted]);

  const handleEmailSearch = async () => {
    try {
      const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-find-guest-by-email', {
        email,
      });

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
        const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-mark-guest-as-present', {
          guestId: searchResult.id, // Assuming the response contains the guest ID
        });

        if (response.status === 200) {
          setGuestInfo(`Guest ${searchResult.name} marked as present.`);
          setSearchResult(null); // Clear search result
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
      {!cameraStarted && (
        <button onClick={startCamera}>Start Camera</button>
      )}
      {cameraStarted && (
        <>
          <video ref={videoRef} width="300" height="300" autoPlay />
          <button onClick={() => setScanning(!scanning)}>
            {scanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
        </>
      )}
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
          <p>Found Guest: {searchResult.name} (Email: {searchResult.email})</p>
          <button onClick={markGuestPresentByEmail}>Mark as Present</button>
        </div>
      )}
      {guestInfo && <div className="guest-info"><p>{guestInfo}</p></div>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default QrScanner;
