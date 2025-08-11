import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { checkUserExists } from '../api';

function Navbar() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const session = isLoggedIn ? JSON.parse(localStorage.getItem('session') || '{}') : null;
  const name = session?.Name;
  const usrType = session?.usr_type;

  const [offCanvasOpen, setOffCanvasOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

 
  const [status, setStatus] = useState(() => (isLoggedIn ? (session?.status ?? null) : null));

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const mailOrId = session?.mail || session?.student_id;
        if (!mailOrId) return;

        const res = await checkUserExists(mailOrId);
        const userStatus = res?.data?.status;

        if (isMounted) {
          setStatus(userStatus);
          const s = JSON.parse(localStorage.getItem('session') || '{}');
          if (s) {
            s.status = userStatus;
            localStorage.setItem('session', JSON.stringify(s));
          }
        }
      } catch (e) {
        if (isMounted) {
          setStatus(null);
        }
      }
    };

    if (isLoggedIn && (session?.mail || session?.student_id)) {
      fetchStatus();
    }


    const onFocus = () => {
      if (isLoggedIn && (session?.mail || session?.student_id)) {
        fetchStatus();
      }
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, [isLoggedIn, session?.mail, session?.student_id]);

  const handleLogout = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
  };


  const statusLoadingForFaculty = usrType === 'Faculty' && status === null;

  // Off-canvas links with dropdowns
  const offCanvasLinks = useMemo(() => {
    if (statusLoadingForFaculty) return [];

    if (usrType === 'Student') {
      return [
        {
          label: 'Profile',
          dropdown: [
            { to: '/profile', label: 'View Own Profile(TBA)' },
          ],
        },
        {
          label: 'Thesis Management',
          dropdown: [
            { to: '/propose', label: 'Propose Thesis Idea' },
            { to: '/synopsis', label: 'View Sample Synopsis' },
            { to: '/resources', label: 'Resources' },
          ],
        },
        {
          label: 'Dummy Links',
          dropdown: [],
        },
        { to: '/dashboard', label: 'Student Dashboard' },
      ];
    }

    if (usrType === 'Faculty' && status === 1) {
      return [
        {
          label: 'Profile',
          dropdown: [
            { to: '/profile', label: 'View Own Profile(TBA)' },
          ],
        },
        {
          label: 'Manage Synopsis',
          dropdown: [
            { to: '/my_synopsis', label: 'View my Synopsis' },
            { to: '/create_synopsis', label: 'Create Synopsis' },
            { to: '/update_synopsis', label: 'Update Synopsis' },
            { to: '/delete_synopsis', label: 'Delete Synopsis' },
          ],
        },
        { to: '/propose', label: 'Student Proposal' },
        { to: '/resources', label: 'Resource Management' },
      ];
    } else if (usrType === 'Faculty') {
      return [];
    }

    if (usrType === 'Admin') {
      return [
        {
          label: 'Login Approvals',
          dropdown: [
            { to: '/show_list', label: 'Approval List' },
            { to: '/show_approval_details', label: 'Show Approval Details' },
            { to: '/approve_login', label: 'Approve Login' },
          ],
        },
        // { to: '/resources', label: 'Resources' },
        // { to: '/manageUsers', label: 'Manage Users' },
      ];
    }
    return [];
  }, [usrType, status, statusLoadingForFaculty]);

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
          <Link to="/dashboard" className="navbar-link login">Home</Link>

          {!statusLoadingForFaculty && (
            <span className="navbar-link Menu" onClick={() => setOffCanvasOpen(true)} style={{ cursor: 'pointer' }}>
              Options
            </span>
          )}

          <a href="https://www.bracu.ac.bd/academic-dates" className="navbar-link" target="_blank" rel="noopener noreferrer">Academic Calendar</a>
          <a href="https://www.bracu.ac.bd/contact" className="navbar-link" target="_blank" rel="noopener noreferrer">Contact</a>
        </div>
        <div className="navbar-user-actions">
          <span className="navbar-user-name">
            {name}{typeof status === 'number'}
          </span>
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
