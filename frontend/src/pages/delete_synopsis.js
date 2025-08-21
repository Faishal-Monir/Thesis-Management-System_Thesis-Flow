import React, { useState } from 'react';
import './delete_synopsis.css';
import { deleteSynopsis } from '../api';

function DeleteSynopsis() {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  const isFaculty = session.usr_type === 'Faculty';
  const [synId, setSynId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isFaculty) {
      setError('Access denied. Only Faculty can delete synopsis.');
      return;
    }
    setLoading(true);
    try {
      await deleteSynopsis({
        sup_id: session.student_id,
        syn_id: Number(synId),
      });
      setSuccess('Synopsis deleted successfully!');
      setSynId('');
    } catch (err) {
      setError('Failed to delete synopsis.');
    }
    setLoading(false);
  };

  return (
    <div className="delete-synopsis-page">
      <div className="delete-synopsis-container">
        <h2 className="delete-synopsis-title">Delete Synopsis</h2>
        <form className="delete-synopsis-form" onSubmit={handleSubmit}>
          <label className="delete-synopsis-label" htmlFor="synId">Synopsis ID</label>
          <input
            id="synId"
            type="number"
            className="delete-synopsis-input"
            value={synId}
            onChange={(e) => setSynId(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter Synopsis ID"
          />
          {error && <div className="delete-synopsis-error">{error}</div>}
          {success && <div className="delete-synopsis-success">{success}</div>}
          <button type="submit" className="delete-synopsis-btn" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DeleteSynopsis;
