/* Navbar.js (fixed: stateful dropdown toggles inside off-canvas) */
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const session = isLoggedIn ? JSON.parse(localStorage.getItem('session') || '{}') : null;
  const name = session?.Name;
  const usrType = session?.usr_type;

  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('session');
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = '/login';
  };

  // Off-canvas links with dropdowns
  const offCanvasLinks = useMemo(() => {

    if (usrType === 'Student') {
      return [
        {
          label: 'Profile',
          dropdown: [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/profile', label: 'View Own Profile' },
          ],
        },
        { to: '/resources', label: 'Resources' },
        { to: '/propose', label: 'Student Proposal' },
      ];
    }



    if (usrType === 'Faculty') {
      return [
        {
          label: 'Profile',
          dropdown: [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/profile', label: 'View Own Profile' },
          ],
        },
         
        { to: '/resources', label: 'Resources' },
        { to: '/createSynopsis', label: 'Create Synopsis' },
      ];
    }


    if (usrType === 'Admin') {
      return [
        {
          label: 'Profile',
          dropdown: [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/profile', label: 'View Own Profile' },
          ],
        },
        { to: '/resources', label: 'Resources' },
        { to: '/manageUsers', label: 'Manage Users' },
      ];
    }
    return [];
  }, 
  
  [usrType]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const closeOffCanvas = () => {
    setOffCanvasOpen(false);
    setOpenGroups({});
  };





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
        <div className="navbar-offcanvas-links">
          {offCanvasLinks.map((link, idx) =>
            link.dropdown ? (
              <div
                key={link.label + idx}
                className={`navbar-offcanvas-dropdown ${openGroups[link.label] ? 'open' : ''}`}
              >
                <div
                  className="navbar-offcanvas-dropdown-header"
                  onClick={() => toggleGroup(link.label)}
                >
                  <span>{link.label}</span>
                  <span className="navbar-offcanvas-caret">
                    {openGroups[link.label] ? '▾' : '▸'}
                  </span>
                </div>
                <div className="navbar-offcanvas-dropdown-content">
                  {link.dropdown.map((sublink, subidx) => (
                    <Link
                      key={sublink.to + subidx}
                      to={sublink.to}
                      className="navbar-offcanvas-link"
                      onClick={closeOffCanvas}
                    >
                      {sublink.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.to + idx}
                to={link.to}
                className="navbar-offcanvas-link"
                onClick={closeOffCanvas}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
      {offCanvasOpen && (
        <div className="navbar-offcanvas-backdrop" onClick={closeOffCanvas}></div>
      )}
    </nav>
  );
}

export default Navbar;
