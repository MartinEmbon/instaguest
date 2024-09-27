import React from 'react';
import './Header.css'; // Import the CSS file for styling

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        {/* Placeholder for logo; replace with actual image URL */}
        <img src="https://via.placeholder.com/150" alt="Logo" />
      </div>
      <h1 className="title">Event Management</h1>
    </header>
  );
};

export default Header;
