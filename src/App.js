import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AddGuest from "./AddGuest";
import ListGuests from "./ListGuests";
import QrScanner from "./QrScanner";
import './styles.css';
import Header from './Header'; // Import the Header component
import Footer from './Footer'; // Import the Footer component

import "./App.css"; // Import your main CSS file here if needed

const App = () => {
  return (
    <Router>
      <div className="app">
      <Header /> {/* Add the Header component */}
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/">Add Guest</Link>
            </li>
            <li>
              <Link to="/guests">Guest List</Link>
            </li>
            <li>
              <Link to="/qrscanner">QR Scanner</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<AddGuest />} />
          <Route path="/guests" element={<ListGuests />} />
          <Route path="/qrscanner" element={<QrScanner />} />
        </Routes>
        <Footer /> {/* Add the Footer component */}
      </div>
    </Router>
  );
};

export default App;
