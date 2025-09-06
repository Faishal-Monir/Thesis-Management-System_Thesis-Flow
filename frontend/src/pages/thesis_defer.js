

import React, { useState, useEffect } from "react";

import { fetchAllThesisDefers, requestThesisDefer, decideThesisDefer, resetThesisDefer } from "../api";

import "./defer_correction.css";

export default function ThesisDefer() { 
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem("session");
    if (cachedUser) setUser(JSON.parse(cachedUser));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetchAllThesisDefers();
        setTheses(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load theses");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleRequestDefer = async (thesis_id) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await requestThesisDefer({ thesis_id });
      setMessage("Defer request submitted");
      const res = await fetchAllThesisDefers();
      setTheses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request defer");
    }
    setLoading(false);
  };

  const handleDecideDefer = async (thesis_id, decision) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await decideThesisDefer({ thesis_id, decision });
      setMessage(`Defer ${decision}`);
      const res = await fetchAllThesisDefers();
      setTheses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update decision");
    }
    setLoading(false);
  };
  
  
  if (loading) return <p className="thesis-loading">Loading theses...</p>;
  if (!user) return <p className="thesis-loading">User not logged in.</p>;

  const studentTheses =
    user.usr_type === "Student"
      ? theses.filter((t) => t.student_ids?.includes(user.student_id))
      : [];

  const pendingTheses =
  user.usr_type === "Faculty"
    ? theses.filter(
        (t) => t.defer_status === "pending" && t.supervisor_id === user.student_id
      )
    : [];
  

  return (
    <div className="thesis-management-container">
      <h2>Thesis Defer Management</h2>

      {error && <div className="thesis-error">{error}</div>}
      {message && <div className="thesis-success">{message}</div>}

      {/* Student View */}
      {user.usr_type === "Student" && studentTheses.length > 0 && (
        <div>
          <h3>Your Thesis</h3>
          {studentTheses.map((t) => (
            <div key={t.thesis_id} className="thesis-card">
              <p><strong>Thesis ID:</strong> {t.thesis_id}</p>
              <p><strong>Status:</strong> {t.defer_status}</p>
              {t.defer_status === "none" && (
                <button
                  className="thesis-btn thesis-btn-blue thesis-btn-block"
                  onClick={() => handleRequestDefer(t.thesis_id)}
                  disabled={loading || t.progress >= 3} // block defer if progress >= 3
                >
                  {loading ? "Requesting..." : "Request Defer"}
                </button>
              )}
              {t.defer_status === "pending" && <p>Request pending approval</p>}
              {t.defer_status === "approved" && <p>Defer approved</p>}
              {t.defer_status === "rejected" && <p>Defer rejected</p>}
            </div>
          ))}
        </div>
      )}

      {/* Faculty View */}
      {user.usr_type === "Faculty" && pendingTheses.length > 0 && (
        <div>
          <h3>Pending Defer Requests</h3>
          {pendingTheses.map((t) => (
            <div key={t.thesis_id} className="thesis-card">
              <p><strong>Thesis ID:</strong> {t.thesis_id}</p>
              <p><strong>Group Members:</strong> {t.student_ids?.join(", ")}</p>
              <p><strong>Progress:</strong> {t.progress}</p>
              <button
                className="thesis-btn thesis-btn-green thesis-btn-block"
                onClick={() => handleDecideDefer(t.thesis_id, "approve")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Approve"}
              </button>
              <button
                className="thesis-btn thesis-btn-red thesis-btn-block"
                onClick={() => handleDecideDefer(t.thesis_id, "reject")}
                disabled={loading}
                style={{ marginTop: "5px" }}
              >
                {loading ? "Processing..." : "Reject"}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Admin View */}
      {user.usr_type === "Admin" && theses.some(t => t.defer_status !== "none") && (
        <div className="thesis-admin-container">
          <h3>Deferred Theses (Admin)</h3>
          {theses
            .filter(t => t.defer_status !== "none")
            .map((thesis) => (
              <div key={thesis.thesis_id} className="thesis-admin-small-card">
                <div className="thesis-mr-6">
                  <p><strong>Thesis ID:</strong> {thesis.thesis_id}</p>
                  
                  <p><strong>Progress:</strong> {thesis.progress}</p>
                  <p><strong>Status:</strong> {thesis.defer_status}</p>
                </div>
                <button
                  className="thesis-btn thesis-btn-red"
                  onClick={async () => {
                    setLoading(true);
                    setMessage("");
                    setError("");
                    try {
                      await resetThesisDefer(thesis.thesis_id);
                      setMessage("Defer reset successfully!");
                      const res = await fetchAllThesisDefers();
                      setTheses(res.data);
                    } catch (err) {
                      console.error(err);
                      setError("Failed to reset defer.");
                    }
                    setLoading(false);
                  }}
                >
                  Reset Defer
                </button>
              </div>
            ))}
          {theses.filter(t => t.defer_status !== "none").length === 0 && <p className="thesis-no-data">No deferred theses.</p>}
        </div>
      )}




      {/* No theses found */}
      {user.usr_type === "Student" && studentTheses.length === 0 && <p className="thesis-no-data">No theses available.</p>}
      {user.usr_type === "Faculty" && pendingTheses.length === 0 && <p className="thesis-no-data">No pending defer requests.</p>}
      {user.usr_type === "Admin" && !theses.some(t => t.defer_status === "defer") && <p className="thesis-no-data">No deferred theses.</p>}

    </div>
  );
}
