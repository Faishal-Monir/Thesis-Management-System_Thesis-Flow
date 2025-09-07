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

  useEffect(() => {
    // Log all stylesheets loaded in the document
    console.log("Loaded stylesheets:");
    Array.from(document.styleSheets).forEach((sheet, i) => {
      console.log(i, sheet.href || "[inline]", sheet);
    });

    // Log computed styles for the feedback card
    setTimeout(() => {
      const card = document.querySelector(".feedback-card");
      if (card) {
        const styles = window.getComputedStyle(card);
        console.log("Computed styles for .feedback-card:", styles);
      } else {
        console.warn(".feedback-card not found in DOM");
      }
    }, 1000);
  }, []);

  const handleGoBack = () => {
  localStorage.removeItem("Group_id");
  localStorage.removeItem("stage");
  window.location.href = "/thesis_progress";
  };

  return (
    <div className="feedback-page-bg">
      <div className="feedback-card">
        <h2 className="feedback-title">Thesis Feedback</h2>
        {loading ? (
          <div className="feedback-error">Loading feedback...</div>
        ) : error ? (
          <div className="feedback-error">{error}</div>
        ) : (
          <>
            <textarea
              className="feedback-textarea"
              value={feedback}
              readOnly
              rows={7}
            />
            <button
              className="feedback-btn"
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
