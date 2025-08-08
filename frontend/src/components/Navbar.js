import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const session = isLoggedIn ? JSON.parse(localStorage.getItem('session') || '{}') : null;
  const name = session?.Name;
  const usrType = session?.usr_type;

  const [offCanvasOpen, setOffCanvasOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('session');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = '/login';
    // window.location.reload();
  };

  let offCanvasLinks = [];
  if (usrType === 'Student') {
    offCanvasLinks = [
      { to: '/profile', label: 'Profile' },
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/resources', label: 'Resources' },
      { to: '/propose', label: 'Student Proposal' },
    ];
  } else if (usrType === 'Faculty') {
    offCanvasLinks = [
      { to: '/profile', label: 'Profile' },
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/resources', label: 'Resources' },
      { to: '/createSynopsis', label: 'Create Synopsis' },
    ];
  } else if (usrType === 'Admin') {
    offCanvasLinks = [
      { to: '/profile', label: 'Profile' },
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/resources', label: 'Resources' },
      { to: '/manageUsers', label: 'Manage Users' },
    ];
  }

  if (!isLoggedIn) {
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



  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <a href="/" className="navbar-logo">
          <img src="/logo.jpg" alt="Logo" className="navbar-logo-image" />
        </a>
        <div className="navbar-links">
          <span className="navbar-link Menu" onClick={() => setOffCanvasOpen(true)} style={{ cursor: 'pointer' }}>Options</span>
          <Link to="/" className="navbar-link login">Home</Link>
          <a href="#" className="navbar-link">Thesis Supervisors</a>
          <a href="https://www.bracu.ac.bd/academic-dates" className="navbar-link" target="_blank" rel="noopener noreferrer">Academic Calendar</a>
          <a href="https://www.bracu.ac.bd/contact" className="navbar-link" target="_blank" rel="noopener noreferrer">Contact</a>
          <Link to="/synopsis" className="navbar-link login">Synopsis</Link>
        </div>
        <div className="navbar-user-actions">
          <span className="navbar-user-name">{name}</span>
          <button className="navbar-logout-btn" onClick={handleLogout}>
            <img src="/logout.png" alt="Logout" />
          </button>

        </div>
      </div>



  

      <div className={`navbar-offcanvas navbar-offcanvas-dark ${offCanvasOpen ? 'open' : ''}`}>
        <button className="navbar-offcanvas-close" onClick={() => setOffCanvasOpen(false)}>&times;</button>
        <div className="navbar-offcanvas-links">
          {offCanvasLinks.map(link => (
            <Link key={link.to} to={link.to} className="navbar-offcanvas-link">{link.label}</Link>
          ))}
        </div>
      </div>
      {offCanvasOpen && <div className="navbar-offcanvas-backdrop" onClick={() => setOffCanvasOpen(false)}></div>}
    </nav>
  );
}

export default Navbar;
