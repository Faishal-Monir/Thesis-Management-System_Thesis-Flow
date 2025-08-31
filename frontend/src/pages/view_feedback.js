import React, { useEffect, useState } from "react";
import "./view_feedback.css";
import { fetchThesisFeedbackAPI } from "../api";

export default function ViewFeedback() {
  const session = JSON.parse(localStorage.getItem("session"));
  const groupId = localStorage.getItem("Group_id");
  const stage = localStorage.getItem("stage");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchFeedback() {
      try {
        if (!groupId || !stage) {
          setError("Missing group or stage information.");
          setLoading(false);
          return;
        }
        const { data } = await fetchThesisFeedbackAPI(groupId, stage);
        setFeedback(data.feedback || "");
      } catch (err) {
        setError((err.response && err.response.data && err.response.data.message) || err.message || "Failed to fetch feedback.");
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [groupId, stage]);

  const handleGoBack = () => {
  localStorage.removeItem("Group_id");
  localStorage.removeItem("stage");
  window.location.href = "/thesis_progress";
  };

  return (
    <div className="update-domain-page">
      <div className="update-domain-container">
        <h2 className="update-domain-title">Thesis Feedback</h2>
        {loading ? (
          <div className="update-domain-error">Loading feedback...</div>
        ) : error ? (
          <div className="update-domain-error">{error}</div>
        ) : (
          <>
            <textarea
              className="update-domain-input"
              value={feedback}
              readOnly
              rows={5}
              style={{ marginBottom: "1rem" }}
            />
            <button
              className="update-domain-btn"
              onClick={handleGoBack}
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
