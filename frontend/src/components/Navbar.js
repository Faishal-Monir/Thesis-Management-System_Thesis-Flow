
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <a href="/" className="navbar-logo">
            <img src="/logo.jpg" alt="Logo" className="navbar-logo-image" />
          <span className="navbar-logo-text">Thesis Management Portal</span>
        </a>
        <div className="navbar-links">
          <Link to="/" className="navbar-link login">Home</Link>
          <a href="#" className="navbar-link">Thesis Supervisors</a>
          <a href="https://www.bracu.ac.bd/academic-dates" className="navbar-link" target="_blank" rel="noopener noreferrer">Academic Calendar</a>
          <a href="https://www.bracu.ac.bd/contact" className="navbar-link" target="_blank" rel="noopener noreferrer">Contact</a>
          <Link to="/synopsis" className="navbar-link login">Synopsis</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
