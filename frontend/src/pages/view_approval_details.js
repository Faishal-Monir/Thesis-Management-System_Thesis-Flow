import React, { useState } from 'react';
import './view_approval_details.css';
import { getApprovalDetails } from '../api';

function ViewApprovalDetails() {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const isAdmin = session.usr_type === 'Admin';
  const [inputId, setInputId] = useState('');
  const [userRecord, setUserRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUserRecord(null);
    if (!isAdmin) {
      setError('You are not authorized to view this page.');
      return;
    }
    setLoading(true);
    try {
      const res = await getApprovalDetails(inputId);
      setUserRecord(res.data.userRecord);
    } catch (err) {
      setError('Failed to fetch approval details.');
    }
    setLoading(false);
  };

  return (
    <div className="view-approval-details-page">
      <div className="view-approval-details-container">
        <h2 className="view-approval-details-title">View Approval Details</h2>
        <form className="view-approval-details-form" onSubmit={handleSubmit}>
          <label className="view-approval-details-label">Enter Supervisor ID</label>
          <input
            type="text"
            className="view-approval-details-input"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="view-approval-details-btn" disabled={loading}>
            {loading ? 'Loading...' : 'View Details'}
          </button>
        </form>
        {error && <div className="view-approval-details-error">{error}</div>}
        {userRecord && (
          <div className="view-approval-details-card">
            <div><strong>Name:</strong> {userRecord.Name}</div>
            <div><strong>Student ID:</strong> {userRecord.student_id}</div>
            <div><strong>Email:</strong> {userRecord.mail}</div>
            <div><strong>User Type:</strong> {userRecord.usr_type}</div>
            <div><strong>Status:</strong> {userRecord.status === 1 ? 'Active' : 'Inactive'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewApprovalDetails;
