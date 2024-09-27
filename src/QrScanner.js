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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera(); // Cleanup on unmount
  }, [scanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: 'environment' },
        },
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
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  const scanQRCode = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      canvas.height = videoRef.current.videoHeight;
      canvas.width = videoRef.current.videoWidth;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        setScannedQRCode(code.data);
        alert(`QR Code scanned: ${code.data}`);
        
        // Call the API with the scanned QR code
        handleSearchByQRCode(code.data);
        
        stopCamera();
      } else {
        requestAnimationFrame(scanQRCode);
      }
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };


  const handleSearchByQRCode = async (qrCode) => {
    try {
      const response = await axios.post('https://us-central1-moonlit-sphinx-400613.cloudfunctions.net/qr-find-guest-by-email', {
        email: qrCode, // Assuming qrCode is the email
      });

      if (response.status === 200 && response.data) {
        setGuestInfo(response.data);
        setError(null);
      } else {
        setError('Guest not found.');
      }
    } catch (err) {
      console.error('Error searching guest by QR code:', err);
      setError('Failed to search guest.');
    }
  };


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
        } else {
          setError('No QR code found in the image.');
        }
      };
    };
    reader.readAsDataURL(file);
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
                    disabled={searchResult.present} // Disable if already present
                  >
                    Mark as Present
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {guestInfo && <div className="guest-info"><p>{guestInfo}</p></div>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default QrScanner;
