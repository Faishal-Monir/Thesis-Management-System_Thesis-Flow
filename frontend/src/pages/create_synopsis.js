import React, { useState } from "react";
import "./create_synopsis.css";
import { registerSynopsis } from "../api";

function CreateSynopsis() {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const isFaculty = session.usr_type === "Faculty";
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isFaculty) {
      setError("Access denied. Only Faculty can register synopsis.");
      return;
    }
    setLoading(true);
    try {
      await registerSynopsis({
        sup_id: session.student_id,
        name: session.Name,
        mail: session.mail,
        topic,
        status: 0,
      });
      setSuccess("Synopsis registered successfully!");
      setTopic("");
    } catch (err) {
      setError("Failed to register synopsis.");
    }
    setLoading(false);
  };

  return (
    <div className="create-synopsis-page">
      <div className="create-synopsis-container">
        <h2 className="create-synopsis-title">Create Synopsis</h2>
        <form className="create-synopsis-form" onSubmit={handleSubmit}>
          <label className="create-synopsis-label" htmlFor="topic">
            Enter your new synopsis Topic:
          </label>
          <input
            id="topic"
            type="text"
            className="create-synopsis-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={loading}
            maxLength={120}
            placeholder="Enter a concise topic"
          />
          {error && <div className="create-synopsis-error">{error}</div>}
          {success && <div className="create-synopsis-success">{success}</div>}
          <button
            type="submit"
            className="create-synopsis-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Synopsis"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSynopsis;
