import React, { useState } from "react";
import "./update_synopsis.css";
import { updateSynopsis } from "../api";

function UpdateSynopsis() {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const isFaculty = session.usr_type === "Faculty";
  const [synId, setSynId] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isFaculty) {
      setError("Access denied. Only Faculty can update synopsis.");
      return;
    }
    setLoading(true);
    try {
      await updateSynopsis({
        syn_id: Number(synId),
        name: session.Name,
        mail: session.mail,
        topic,
        status: Number(status),
      });
      setSuccess("Synopsis updated successfully!");
      setSynId("");
      setTopic("");
      setStatus("");
    } catch (err) {
      setError("Failed to update synopsis.");
    }
    setLoading(false);
  };

  return (
    <div className="update-synopsis-page">
      <div className="update-synopsis-container">
        <h2 className="update-synopsis-title">Update Synopsis</h2>
        <form className="update-synopsis-form" onSubmit={handleSubmit}>
          <label className="update-synopsis-label" htmlFor="synId">
            Synopsis ID
          </label>
          <input
            id="synId"
            type="number"
            className="update-synopsis-input"
            value={synId}
            onChange={(e) => setSynId(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter Synopsis ID"
          />

          <label className="update-synopsis-label" htmlFor="topic">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            className="update-synopsis-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={loading}
            maxLength={120}
            placeholder="Enter updated topic"
          />

          <label className="update-synopsis-label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="update-synopsis-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select Status</option>
            <option value="0">Available</option>
            <option value="1">Taken</option>
          </select>

          {error && <div className="update-synopsis-error">{error}</div>}
          {success && <div className="update-synopsis-success">{success}</div>}

          <button
            type="submit"
            className="update-synopsis-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateSynopsis;
