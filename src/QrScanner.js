import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import './QrScanner.css';

const QrScanner = () => {
  const [guestInfo, setGuestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [scannedQRCode, setScannedQRCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false); // State to track camera status
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      requestAnimationFrame(scanQRCode);
    };

    if (isCameraActive) {
      startCamera();
    } else {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop()); // Stop the camera stream
        }
      }
    }

    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCameraActive]); // Start camera when isCameraActive changes

  const scanQRCode = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = videoRef.current.videoHeight;
      canvas.width = videoRef.current.videoWidth;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        setScannedQRCode(code.data);
        handleSearchByQRCode(code.data); // Automatically search by scanned QR code
        setIsCameraActive(false); // Stop the camera after finding a code
      } else {
        scanningRef.current = true; // Continue scanning
        requestAnimationFrame(scanQRCode);
      }
    } else {
      requestAnimationFrame(scanQRCode);
    }
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

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev); // Toggle camera state
    setScannedQRCode(''); // Clear scanned QR code
    setSearchResult(null); // Clear previous search results
    setError(null); // Clear errors
  };

  return (
    <div className="qr-scanner">
      <h2>QR Scanner</h2>
      <button onClick={toggleCamera}>
        {isCameraActive ? 'Stop Camera' : 'Start Camera'}
      </button>
      {isCameraActive && (
        <>
          <video ref={videoRef} style={{ width: '100%', maxWidth: '500px' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}
      {scannedQRCode && <p>Scanned QR Code: {scannedQRCode}</p>}
      {searchResult && (
        <div className="search-result">
          {/* Display your search result here as before */}
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default QrScanner;
