import React, { useState } from "react";
import "./submit_thesis_feedback.css";
import "./update_domain.css";
import { updateThesisFeedbackAPI } from "../api";

export default function SubmitThesisFeedback() {
  const session = JSON.parse(localStorage.getItem("session"));
  const groupId = localStorage.getItem("Group_id");
  const stage = localStorage.getItem("stage");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  if (!session || session.usr_type !== "Faculty") {
    return (
      <div className="update-domain-page">
        <div className="update-domain-container">
          <h2 className="update-domain-title">Submit Thesis Feedback</h2>
          <div className="update-domain-error">Access denied. Only faculty can submit feedback.</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (!groupId || !stage) {
        setError("Missing group or stage information.");
        setLoading(false);
        return;
      }
      if (!feedback.trim()) {
        setError("Please enter feedback.");
        setLoading(false);
        return;
      }
      // Call API (axios)
      await updateThesisFeedbackAPI(groupId, { stage, feedback });
      setSuccess("Feedback submitted successfully.");
      setFeedback("");
    
      localStorage.removeItem("Group_id");
      localStorage.removeItem("stage");
      setTimeout(() => {
        window.location.href = "/thesis_progress";
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to submit feedback.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-domain-page">
      <div className="update-domain-container">
        <h2 className="update-domain-title">Submit Thesis Feedback</h2>
        <form className="update-domain-form" onSubmit={handleSubmit}>
          <label className="update-domain-label" htmlFor="feedback">Feedback for {stage}:</label>
          <textarea
            id="feedback"
            className="update-domain-input"
            rows={5}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            disabled={loading}
            placeholder="Enter feedback here..."
          />
          <button
            type="submit"
            className="update-domain-btn"
            disabled={loading || !feedback.trim()}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
          {error && <div className="update-domain-error">{error}</div>}
          {success && <div className="update-domain-success">{success}</div>}
        </form>
      </div>
    </div>
  );
}
