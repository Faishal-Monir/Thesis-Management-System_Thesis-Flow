

import React, { useEffect, useState } from "react";
import { 
  fetchAllTheses, 
  requestThesisCorrection, 
  approveThesisCorrection, 
  correctThesisAPI, 
  resetThesisCorrection 
} from "../api";

import "./defer_correction.css";

export default function ThesisCorrection() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [topicInputs, setTopicInputs] = useState({});
  const [abstractInputs, setAbstractInputs] = useState({});

  // Load user from session
  useEffect(() => {
    const cachedUser = localStorage.getItem("session");
    if (cachedUser) setUser(JSON.parse(cachedUser));
  }, []);

  // Load theses
  const loadTheses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchAllTheses();
      setTheses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load theses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTheses(); }, [user]);

  // Student requests correction
  const handleRequestCorrection = async (thesis_id) => {
    setLoading(true); setError(""); setMessage("");
    try {
      await requestThesisCorrection(thesis_id);
      setMessage("Correction request submitted.");
      await loadTheses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request correction");
    }
    setLoading(false);
  };

  // Faculty approves
  const handleApproveCorrection = async (thesis_id) => {
    setLoading(true); setError(""); setMessage("");
    try {
      await approveThesisCorrection(thesis_id);
      setMessage("Correction approved.");
      await loadTheses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve correction");
    }
    setLoading(false);
  };

  // Student updates topic & abstract
  const handleUpdateTopic = async (thesis_id) => {
    const topic = topicInputs[thesis_id];
    const abstract = abstractInputs[thesis_id];
    if (!topic || !abstract) return setError("Both topic and abstract are required.");
    setLoading(true); setError(""); setMessage("");
    try {
      await correctThesisAPI(thesis_id, { topic, abstract });
      setMessage("Thesis updated successfully.");
      await loadTheses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update thesis");
    }
    setLoading(false);
  };

  // Admin resets
  const handleResetCorrection = async (thesis_id) => {
    setLoading(true); setError(""); setMessage("");
    try {
      await resetThesisCorrection(thesis_id);
      setMessage("Correction reset successfully.");
      await loadTheses();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset correction");
    }
    setLoading(false);
  };

  if (!user) return <p className="thesis-loading">User not logged in.</p>;
  if (loading) return <p className="thesis-loading">Loading theses...</p>;

  // Filter views
  const studentTheses = user.usr_type === "Student"
    ? theses.filter(t => t.student_ids?.includes(user.student_id))
    : [];
  const pendingTheses = user.usr_type === "Faculty"
  ? theses.filter(t => t.correction_request && !t.correction_approved && t.supervisor_id === user.student_id)
  : [];


  return (
    <div className="thesis-management-container">
      <h2>Thesis Correction Management</h2>
      {error && <div className="thesis-error">{error}</div>}
      {message && <div className="thesis-success">{message}</div>}

      {/* Student View */}
      {user.usr_type === "Student" && studentTheses.length > 0 && (
        <div>
          <h3>Your Thesis</h3>
          {studentTheses.map(t => (
            <div key={t.thesis_id} className="thesis-card">
              <p><strong>Thesis ID:</strong> {t.thesis_id}</p>
              <p><strong>Topic:</strong> {t.topic}</p>
              <p>
                <strong>Status:</strong>{" "}
                {t.updated_topic ? "Updated" :
                 t.correction_approved ? "Approved" :
                 t.correction_request ? "Request Sent" : "Not Requested"}
              </p>

              {!t.correction_request && (
                <button
                  className="thesis-btn thesis-btn-blue thesis-btn-block"
                  onClick={() => handleRequestCorrection(t.thesis_id)}
                  disabled={loading}
                >
                  {loading ? "Requesting..." : "Request Correction"}
                </button>
              )}

              {t.correction_approved && !t.updated_topic && (
                <div className="thesis-input-container">
                  <input
                    type="text"
                    placeholder="New Topic"
                    value={topicInputs[t.thesis_id] || ""}
                    onChange={e => setTopicInputs({...topicInputs, [t.thesis_id]: e.target.value})}
                    className="thesis-input"
                  />
                  <input
                    type="text"
                    placeholder="New Abstract"
                    value={abstractInputs[t.thesis_id] || ""}
                    onChange={e => setAbstractInputs({...abstractInputs, [t.thesis_id]: e.target.value})}
                    className="thesis-input"
                  />
                  <button
                    className="thesis-btn thesis-btn-green"
                    onClick={() => handleUpdateTopic(t.thesis_id)}
                  >
                    Update
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Faculty View */}
      {user.usr_type === "Faculty" && pendingTheses.length > 0 && (
        <div>
          <h3>Pending Correction Requests</h3>
          {pendingTheses.map(t => (
            <div key={t.thesis_id} className="thesis-card">
              <p><strong>Thesis ID:</strong> {t.thesis_id}</p>
              <p><strong>Group Members:</strong> {t.student_ids.join(", ")}</p>
              <button
                className="thesis-btn thesis-btn-green thesis-btn-block"
                onClick={() => handleApproveCorrection(t.thesis_id)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Admin View */}
      {user.usr_type === "Admin" && theses.some(t => t.updated_topic || t.correction_request) && (
        <div>
          <h3>Theses Correction Management (Admin)</h3>
          {theses.filter(t => t.updated_topic || t.correction_request).map(t => (
            <div key={t.thesis_id} className="thesis-admin-card">
              <div> 
                <p><strong>Thesis ID:</strong> {t.thesis_id}</p>
                <p><strong>Topic:</strong> {t.topic}</p>
                <p><strong>Status:</strong>{" "}
                  {t.updated_topic ? "Updated" :
                   t.correction_approved ? "Approved" :
                   t.correction_request ? "Request Sent" : "Not Requested"}
                </p>
              </div>
              <button
                className="thesis-btn thesis-btn-red"
                onClick={() => handleResetCorrection(t.thesis_id)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Reset Correction"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No theses */}
      {user.usr_type === "Student" && studentTheses.length === 0 && <p className="thesis-no-data">No theses available.</p>}
      {user.usr_type === "Faculty" && pendingTheses.length === 0 && <p className="thesis-no-data">No pending correction requests.</p>}
      {user.usr_type === "Admin" && !theses.some(t => t.updated_topic || t.correction_request) && <p className="thesis-no-data">No theses to manage.</p>}
    </div>
  );
}