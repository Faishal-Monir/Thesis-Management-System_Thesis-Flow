import React, { useEffect, useState } from "react";
import "./resources.css";
import { fetchResourcesAPI, addResourceAPI, deleteResourceAPI } from "../api";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState(null);

  const session = JSON.parse(localStorage.getItem("session"));
  const isFaculty = session?.usr_type === "Faculty";

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";
  

  // Load all resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await fetchResourcesAPI();
        setResources(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      setSuccessMsg("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [error, successMsg]);

  // Add new resource
  const handleAddResource = async () => {
    if (!newTitle.trim() || !newFile) {
      setError("Title and file are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", newTitle.trim());
    formData.append("file", newFile);

    try {
      setLoading(true);
      const res = await addResourceAPI(formData);
      setResources(prev => [...prev, res]);
      setNewTitle("");
      setNewFile(null);
      setShowAddForm(false);
      setSuccessMsg("Resource added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete resource
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteResourceAPI(id);
      setResources(prev => prev.filter(r => r._id !== id));
      setSuccessMsg("Resource deleted successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper to check file type
  const isPDF = (filename) => filename.endsWith(".pdf");
  const isWord = (filename) => filename.endsWith(".doc") || filename.endsWith(".docx");

  return (
    <>
      {/* Animated background particles */}
      <div className="bg-animation">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="resources-container">
        <h1 className="resources-title">Thesis Resources</h1>

        {successMsg && <div className="success-popup">{successMsg}</div>}
        {error && <div className="error-popup">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : resources.length === 0 ? (
          <p className="resources-empty">No resources found.</p>
        ) : (
          <ul className="resources-list">
            {resources.map(({ _id, title, filePath }) => {
              const fileName = filePath.split("/").pop();
              const fileUrl = `${API_BASE_URL}${filePath}`;
              const downloadUrl = `${API_BASE_URL}/resources/download/${fileName}`;

              return (
                <li key={_id} className="resource-item">
                  <div className="resource-content">
                    <div className="links-container">
                      <strong className="resource-title">{title}</strong>
                      <div className="resource-links mt-2">
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">View File</a>{" | "}
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download>Download</a>
                      </div>
                    </div>

                    {isFaculty && (
                      <div className="button-group mt-2">
                        <button className="delete-button" onClick={() => handleDelete(_id)}>Delete</button>
                      </div>
                    )}
                  </div>

                  {isPDF(filePath) && (
                    <object
                      data={fileUrl}
                      type="application/pdf"
                      width="100%"
                      height="400px"
                      style={{ marginTop: "10px", border: "1px solid #ccc" }}
                    >
                      <p>
                        PDF cannot be displayed.{" "}
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                      </p>
                    </object>
                  )}

                  {isWord(filePath) && (
                    <iframe
                      src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
                      width="100%"
                      height="500px"
                      frameBorder="0"
                      title={title}
                      style={{ marginTop: "10px", border: "1px solid #ccc" }}
                    ></iframe>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {isFaculty && (
          <div className="add-link-wrapper mt-4">
            {!showAddForm ? (
              <button className="resources-button" onClick={() => setShowAddForm(true)}>Add New Resource</button>
            ) : (
              <div className="resources-form mt-2">
                <input
                  type="text"
                  placeholder="Enter resource title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="resources-input"
                />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setNewFile(e.target.files[0])}
                  className="resources-input"
                />
                <div className="form-buttons">
                  <button className="resources-button mt-2" onClick={handleAddResource} disabled={loading}>
                    {loading ? "Adding..." : "Add Resource"}
                  </button>
                  <button
                    className="resources-button mt-2"
                    style={{background: "linear-gradient(135deg, #64748b, #475569)"}}
                    onClick={() => { setShowAddForm(false); setNewTitle(""); setNewFile(null); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}