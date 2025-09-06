import { useEffect, useState } from "react";
import "./studentDashboard.css";
import { fetchStudentById } from "../api";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get cached student info
    const cached = JSON.parse(localStorage.getItem('session') || '{}');
    const student_id = cached.student_id;
    fetchStudentById(student_id)
      .then((res) => {
        setStudent(res.data.user);
        setRole(res.data.role);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch student");
        setLoading(false);
      });
  }, []);

  const getRoleIcon = () => {
    switch(role) {
      case "Faculty": return "👨‍🏫";
      case "Admin": return "🛡️";
      case "Ra": return "👥";
      case "Ta": return "🎓";
      default: return "👤";
    }
  };

  const getRoleColor = () => {
    switch(role) {
      case "Faculty": return "role-faculty";
      case "Admin": return "role-admin";
      case "Ra": return "role-ra";
      case "Ta": return "role-ta";
      default: return "role-student";
    }
  };

  const getIdLabel = () => {
    switch(role) {
      case "Faculty": return "Faculty ID";
      case "Admin": return "Admin ID";
      case "Ra": return "RA ID";
      case "Ta": return "TA ID";
      default: return "Student ID";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-background-pattern"></div>
      
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-icon">
            <span>👤</span>
          </div>
          <h1 className="dashboard-title">User Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back to your personalized dashboard</p>
        </div>

        {error && (
          <div className="dashboard-error">
            <div className="error-icon">!</div>
            <p>{error}</p>
          </div>
        )}

        {student ? (
          <div className="student-card">
            {/* Profile Section */}
            <div className="profile-section">
              <div className="profile-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-name">{student.name}</h2>
              <div className={`profile-role ${getRoleColor()}`}>
                <span className="role-icon">{getRoleIcon()}</span>
                <span>{role}</span>
              </div>
              <div className={`profile-status ${student.status === 1 ? 'status-active' : 'status-inactive'}`}>
                <div className="status-dot"></div>
                <span>{student.status === 1 ? "Active" : "Inactive"}</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="details-section">
              <div className="section-header">
                <h3 className="section-title">Account Information</h3>
                <p className="section-subtitle">Personal and institutional details</p>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label className="detail-label">Email Address</label>
                  <div className="detail-value">{student.email}</div>
                </div>

                <div className="detail-item">
                  <label className="detail-label">{getIdLabel()}</label>
                  <div className="detail-value id-value">{student.student_id}</div>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Account Type</label>
                  <div className="detail-value">{role}</div>
                </div>

                <div className="detail-item">
                  <label className="detail-label">Member Since</label>
                  <div className="detail-value">{new Date().getFullYear()}</div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-label">Status</div>
                  <div className="stat-value">{student.status === 1 ? "Active" : "Inactive"}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🏫</div>
                  <div className="stat-label">Institution</div>
                  <div className="stat-value">BRAC University</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-label">Last Login</div>
                  <div className="stat-value">Today</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer">
              <p>Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <span>👤</span>
              </div>
              <h3>No User Found</h3>
              <p className="empty-message">Please check your login credentials and try again.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
