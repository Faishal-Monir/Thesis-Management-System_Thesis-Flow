import React, { useEffect, useState } from 'react';
import './admin_approval_list.css';
import { getApprovalList, enlistDomain } from '../api';


function AdminApprovalList() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [sortType, setSortType] = useState('');

  // Function to fetch approval list
  const fetchApprovals = () => {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const isAdmin = session?.usr_type === 'Admin';

    if (!isAdmin) {
      setError('Access denied. Only Admin can view this page.');
      setLoading(false);
      return;
    }

    getApprovalList()
      .then(res => {
        setApprovals(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch approval list.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
    }
  };

  if (loading) {
    return (
      <div className="admin-approval-page">
        <h2 className="admin-approval-title">Admin Approval List</h2>
        <div className="admin-approval-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-approval-page">
        <h2 className="admin-approval-title">Admin Approval List</h2>
        <div className="admin-approval-error">{error}</div>
      </div>
    );
  }

  let sortedApprovals = approvals;
  if (sortType === 'domain_enlistment') {
    sortedApprovals = approvals.filter(a => a.type === 'domain_enlistment');
  } else if (sortType === 'login') {
    sortedApprovals = approvals.filter(a => a.type === 'login');
  }

  return (
    <div className="admin-approval-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h2 className="admin-approval-title">Admin Approval List</h2>
        <div className="approval-sort-menu">
          <select
            className="approval-sort-select"
            value={sortType}
            onChange={e => setSortType(e.target.value)}
          >
            <option value="">Show All Types</option>
            <option value="domain_enlistment">Show Only Domain Enlistment</option>
            <option value="login">Show Only Login</option>
          </select>
        </div>
      </div>

      <div className="approval-card-list">
        {sortedApprovals.map((app) => {
          const isActive = Number(app.status) === 1;
          const cardKey = app._id || app.sup_id;
          const isCopied = copiedId === cardKey;

          return (
            <div className="approval-card" key={cardKey}>
              <div className="approval-card-header minimal">
                <div className="approval-card-id" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Supervisor ID: <span>{app.sup_id}</span></span>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopy(app.sup_id, cardKey)}
                    aria-label="Copy Supervisor ID"
                    title={isCopied ? 'Copied!' : 'Copy'}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="approval-card-body">
                <div className="approval-field">
                  <div className="field-label">Type:</div>
                  <div className="field-text">{app.type}</div>
                </div>
                {app.msg && (
                  <div className="approval-field msg-field">
                    <div className="field-label" style={{ marginBottom: '1.25rem' }}>Msg:</div>
                    <div className="msg-box-wrapper">
                      <div className="msg-box">{app.msg}</div>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy(app.msg, cardKey + '-msg')}
                        aria-label="Copy Msg"
                        title={copiedId === cardKey + '-msg' ? 'Copied!' : 'Copy'}
                      >
                        {copiedId === cardKey + '-msg' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
            
                {app.type === 'domain_enlistment' && (
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button
                      className="enlist-btn"
                      type="button"
                      onClick={async () => {
                        try {
                          await enlistDomain(app.msg || '');
                          alert('Domain enlisted successfully!');
                          fetchApprovals();
                        } catch (err) {
                          alert('Failed to enlist domain.');
                          fetchApprovals();
                        }
                      }}
                    >
                      Enlist
                    </button>
                  </div>
                )}
              </div>

              <div className="approval-card-footer">
                <div className="approval-card-status">
                  <span className={isActive ? 'status-dot active' : 'status-dot inactive'}></span>
                  <span className="status-text">{isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedApprovals.length === 0 && (
          <div className="approval-empty">No approvals found.</div>
        )}
      </div>
    </div>
  );
}

export default AdminApprovalList;
