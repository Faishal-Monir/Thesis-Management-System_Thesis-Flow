import React, { useState } from 'react';
import './login_approve.css';
import { approveUser } from '../api';
import { sendRegistrationEmail, getApprovalDetails } from '../api';

function LoginApprove() {
  const [id, setId] = useState('');
  const [usrType, setUsrType] = useState('Faculty');
  const [status, setStatus] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    if (!id) {
      setError('Please enter an ID.');
      setLoading(false);
      return;
    }
    const payload = {
      usr_type: usrType || 'Faculty',
      status: status ? parseInt(status) : 1
    };
    try {
      const res = await approveUser(id, payload);
      setResult(res.data);
      const detailsRes = await getApprovalDetails(id);
      const userMail = detailsRes.data && detailsRes.data.userRecord && detailsRes.data.userRecord.mail;
      if (userMail) {
        setSuccess('Approval successful! Sending email...');
        await sendRegistrationEmail({
          mail: userMail,
          subject: 'Your account is approved',
          msg: `Thank you for registering in our Thesis Management System your account is now approved.\nYou can login by simply going to the following Link: \n\n${process.env.REACT_APP_FRONTEND_BASE_URL}/login`
        });
        setSuccess('');
      } else {
        setSuccess('Approval successful!');
      }
    } catch (err) {
      setError('Failed to approve user.');
    }
    setLoading(false);
  };

  return (
    <div className="login-approve-page">
      <div className="login-approve-container">
        <h2 className="login-approve-title">Approve User Login</h2>
        <form className="login-approve-form" onSubmit={handleSubmit}>
          <div className="login-approve-field">
            <label className="login-approve-label">User ID</label>
            <input
              type="text"
              className="login-approve-input"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="Enter user ID"
              disabled={loading}
              required
            />
          </div>
          <div className="login-approve-field">
            <label className="login-approve-label">User Type</label>
            <select
              className="login-approve-input"
              value={usrType}
              onChange={e => setUsrType(e.target.value)}
              disabled={loading}
            >
              <option value="Faculty">Faculty</option>
              <option value="Ra">Ra</option>
              <option value="Ta">Ta</option>
              <option value="Admin">Admin-[!!Beaware!!]</option>

            </select>
          </div>
          <div className="login-approve-field">
            <label className="login-approve-label">Status</label>
            <select
              className="login-approve-input"
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={loading}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <button type="submit" className="login-approve-btn" disabled={loading}>
            {loading ? 'Approving...' : 'Approve'}
          </button>
        </form>
        {error && <div className="login-approve-error">{error}</div>}
        {success && <div className="login-approve-success">{success}</div>}
        {result && (
          <div className="login-approve-result">
            <div><strong>Message:</strong> {result.message || 'User approved successfully.'}</div>
            {result.user && (
              <div><strong>User:</strong> {JSON.stringify(result.user)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginApprove;
