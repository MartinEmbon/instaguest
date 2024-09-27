import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios'; // Import axios
import './QrScanner.css';

const QrScanner = () => {
  const videoRef = useRef(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [guestInfo, setGuestInfo] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        videoRef.current.srcObject = stream;

        // Start the video playback
        videoRef.current.play();
        
        // Create a function to scan QR codes
        const scanQRCode = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          const drawFrame = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0) {
              canvas.height = videoRef.current.videoHeight;
              canvas.width = videoRef.current.videoWidth;
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, canvas.width, canvas.height);
              
              if (code) {
                // Handle QR code data (e.g., mark guest present)
                console.log('QR Code Data:', code.data);
                // You can also implement additional functionality here if needed.
              }
            }
            requestAnimationFrame(drawFrame);
          };

          requestAnimationFrame(drawFrame);
        };

        scanQRCode();
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check your device settings.');
      }
    };

    initCamera();

    // Cleanup function to stop the video stream and reset srcObject
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stop each track
        videoRef.current.srcObject = null; // Reset srcObject to null
      }
    };
  }, []);

  // Function to handle email search using axios
  const handleEmailSearch = async () => {
    try {
      const response = await axios.get(`YOUR_API_ENDPOINT_TO_GET_GUEST_BY_EMAIL`, {
        params: { email }
      });
      const data = response.data;
      if (data) {
        setSearchResult(data);
        setGuestInfo('');
      } else {
        setSearchResult(null);
        setGuestInfo('Guest not found.');
      }
    } catch (err) {
      console.error('Error fetching guest:', err);
      setError('Error fetching guest data.');
    }
  };

  // Function to mark guest as present by email using axios
  const markGuestPresentByEmail = async () => {
    if (searchResult) {
      try {
        const response = await axios.post(`YOUR_API_ENDPOINT_TO_MARK_GUEST_PRESENT`, {
          email: searchResult.email
        });
        if (response.status === 200) {
          setGuestInfo(`Guest ${searchResult.name} marked as present.`);
          setEmail(''); // Clear email input
          setSearchResult(null); // Clear search result
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
      <h2>Scan Guest QR Code</h2>
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
      <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};

export default QrScanner;
