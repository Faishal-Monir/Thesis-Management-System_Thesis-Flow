import React, { useEffect, useState } from "react";
import { fetchAllTheses, fetchThesisByIdAPI, uploadThesisProgressAPI, fetchUserByEmail, getReportFileURL } from "../api";
import "./thesis_progress.css";

export default function ThesisProgress() {
  const [theses, setTheses] = useState([]);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [supervisorMap, setSupervisorMap] = useState({});
  const [faculties, setFaculties] = useState([]);

  const session = JSON.parse(localStorage.getItem("session"));
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5005";

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session) {
          setError("Please log in to view thesis progress.");
          setLoading(false);
          return;
        }

        // Fetch all theses
        const resTheses = await fetchAllTheses();
        let data = resTheses.data.map(t => ({
          ...t,
          student_ids: t.student_ids || [],
        }));

        if (!data || data.length === 0) {
          setError("No thesis data available.");
          setLoading(false);
          return;
        }

        // Fetch all users and filter faculty
        const resUsers = await fetchUserByEmail("");
        setFaculties(resUsers.data.filter(u => u.usr_type === "Faculty"));

        const supervisorMap = {};
        resUsers.data
          .filter(u => u.usr_type === "Faculty")
          .forEach(fac => {
            supervisorMap[fac.student_id] = {
              name: fac.Name,
              email: fac.mail,
            };
          });
        setSupervisorMap(supervisorMap);

        // Filter theses based on user type
        let filteredTheses = [];
        if (session.usr_type === "Student") {
          filteredTheses = data.filter(t => t.student_ids.includes(session.student_id));
        } else if (session.usr_type === "Faculty") {
          filteredTheses = data.filter(t => t.supervisor_id === session.student_id);
        }

        if (filteredTheses.length === 0) {
          setError(
            session.usr_type === "Faculty"
              ? "Access denied. You are not supervising any thesis group."
              : "You are not part of any registered thesis group."
          );
          setLoading(false);
          return;
        }

        // Set all theses for faculty, single thesis for student
        setTheses(filteredTheses);

        if (session.usr_type === "Student") {
          setSelectedThesis(filteredTheses[0]);
        } else if (session.usr_type === "Faculty") {
          setSelectedThesis(filteredTheses[0]);
        }
      } catch (err) {
        setError(err.message || "Failed to load thesis data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNextStage = (progress) => {
    switch (progress) {
      case 0: return "P1";
      case 1: return "P2";
      case 2: return "P3";
      default: return "";
    }
  };

  const getProgressLabel = (progress) => {
    switch (progress) {
      case 0: return "None";
      case 1: return "P1";
      case 2: return "P2";
      case 3: return "P3";
      default: return "Unknown";
    }
  };

  const nextStage = selectedThesis ? getNextStage(selectedThesis.progress) : "";
  const allSubmitted = selectedThesis && selectedThesis.progress >= 3;
  const isStudent = session?.usr_type === "Student";
  const isFaculty = session?.usr_type === "Faculty";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadError("");

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      setFile(null);
      e.target.value = "";
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!isStudent) {
      setUploadError("Only students can upload progress reports.");
      return;
    }
    if (!file) {
      setUploadError("Please select a file");
      return;
    }
    if (!nextStage) {
      setUploadError("No valid stage to upload");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to Upload?");
    if (!confirmed) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("report", file);
      formData.append("stage", nextStage);

      const updatedThesis = await uploadThesisProgressAPI(selectedThesis.thesis_id, formData);
      setSelectedThesis(updatedThesis);
      setTheses(prev => prev.map(t => t.thesis_id === updatedThesis.thesis_id ? updatedThesis : t));
      setFile(null);

      const fileInput = document.querySelector('.tp-file-input');
      if (fileInput) fileInput.value = "";

    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isPDF = (filename) => filename?.toLowerCase().endsWith(".pdf");
  const isWord = (filename) => {
    if (!filename) return false;
    const lower = filename.toLowerCase();
    return lower.endsWith(".doc") || lower.endsWith(".docx");
  };

  const getFileIcon = (filename) => {
    if (isPDF(filename)) return "📄";
    if (isWord(filename)) return "📝";
    return "📎";
  };

  const getFileName = (filePath) => {
    if (!filePath) return "";
    return filePath.split("/").pop() || filePath;
  };

  const renderFileViewer = (stage, fileUrl) => {
    if (!fileUrl) return null;

    const fileName = getFileName(fileUrl);

    return (
      <div className="file-preview submitted">
        <p>{getFileIcon(fileName)} {fileName}</p>
        <p><em>Document ready for viewing</em></p>
        <div className="tp-file-viewer">
          {isPDF(fileUrl) ? (
            <object data={fileUrl} type="application/pdf" width="100%" height="400px" style={{ borderRadius: "4px" }}>
              <p>
                PDF cannot be displayed. 
                <br />
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <button className="file-preview button">Download PDF</button>
                </a>
              </p>
            </object>
          ) : isWord(fileUrl) ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              width="100%"
              height="500px"
              frameBorder="0"
              title={`${stage} Report Viewer`}
              style={{ borderRadius: "4px" }}
            >
              <p>
                Document cannot be displayed. 
                <br />
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <button className="file-preview button">View Document</button>
                </a>
              </p>
            </iframe>
          ) : (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <button className="file-preview button">View File</button>
              </a>
            </div>
          )}

          {/* Faculty + Student Feedback Buttons */}
          {(isFaculty || isStudent) && (
            <div style={{ margin: "10px", textAlign: "center", display: "flex", justifyContent: "center", gap: "12px" }}>
              {isFaculty && (
                <>
                  <button
                    className="tp-button"
                    onClick={() => {
                      if (selectedThesis && selectedThesis.group_id) {
                        localStorage.setItem("Group_id", selectedThesis.group_id);
                      }
                      if (stage) localStorage.setItem("stage", stage);
                      window.location.href = "/feedback";
                    }}
                  >
                    📝 Submit Feedback
                  </button>
                  <button
                    className="tp-button"
                    onClick={() => {
                      if (selectedThesis && selectedThesis.group_id) {
                        localStorage.setItem("Group_id", selectedThesis.group_id);
                      }
                      if (stage) localStorage.setItem("stage", stage);
                      window.location.href = "/viewfeedback";
                    }}
                  >
                    View Feedback
                  </button>
                </>
              )}
              {isStudent && (
                <button
                  className="tp-button"
                  onClick={() => {
                    if (selectedThesis && selectedThesis.group_id) {
                      localStorage.setItem("Group_id", selectedThesis.group_id);
                    }
                    if (stage) localStorage.setItem("stage", stage);
                    window.location.href = "/viewfeedback";
                  }}
                >
                  View Thesis Feedback
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNotSubmittedPreview = () => (
    <div className="file-preview not-submitted">
      <p>⏳ Awaiting submission</p>
    </div>
  );

  if (loading) return <div className="resources-container"><div className="tp-loading">Loading thesis progress...</div></div>;
  if (error) return <div className="resources-container"><div className="tp-error">{error}</div></div>;
  if (!selectedThesis) return <div className="resources-container"><p>No thesis data available.</p></div>;

  const containerClass = allSubmitted ? "resources-container completed" : "resources-container";
  const progressClass = allSubmitted ? "progress-indicator completed" : "progress-indicator";

  return (
    <div className={containerClass}>
      {isFaculty && theses.length > 1 && (
        <div className="group-selector" style={{ backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "5px", marginBottom: "20px", border: "1px solid #2196f3" }}>
          <h3>Select Group to View:</h3>
          <select 
            value={selectedThesis?.thesis_id || ""} 
            onChange={(e) => {
              const thesisId = e.target.value;
              const thesis = theses.find(t => t.thesis_id == thesisId);
              if (thesis) setSelectedThesis(thesis);
            }}
            style={{ padding: "8px 12px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "250px" }}
          >
            {theses.map(thesis => (
              <option key={thesis.thesis_id} value={thesis.thesis_id}>
                Group {thesis.group_id} - {thesis.topic.substring(0, 50)}{thesis.topic.length > 50 ? '...' : ''}
              </option>
            ))}
          </select>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#666" }}>
            You are supervising {theses.length} group{theses.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <h2 className="tp-heading">Thesis Progress - Group {selectedThesis.group_id}</h2>
      <p className="tp-topic"><strong>Topic:</strong> {selectedThesis.topic}</p>

      <p><strong>Supervisor ID:</strong> {selectedThesis.supervisor_id}</p>
      <p><strong>Supervisor Name:</strong> {supervisorMap[selectedThesis.supervisor_id]?.name || "N/A"}</p>
      <p><strong>Supervisor Email:</strong> {supervisorMap[selectedThesis.supervisor_id]?.email || "N/A"}</p>
      {selectedThesis.student_ids && <p><strong>Group Members:</strong> {selectedThesis.student_ids.join(", ")}</p>}
      <p><strong>Current Stage:</strong> <span className={progressClass}>{allSubmitted ? "Completed" : getProgressLabel(selectedThesis.progress)}</span></p>

      {isFaculty && (
        <div className="faculty-view-indicator" style={{ backgroundColor: "#e3f2fd", padding: "10px", borderRadius: "5px", marginBottom: "15px", border: "1px solid #2196f3" }}>
          <p><strong>Faculty View:</strong> You are viewing this group's progress as their supervisor.</p>
        </div>
      )}

      <h3>Reports</h3>
      <ul>
        {["P1", "P2", "P3"].map(stage => {
          const fileUrl = selectedThesis.reports[stage] ? getReportFileURL(selectedThesis.reports[stage]) : null;
          const isSubmitted = !!fileUrl;
          return (
            <li key={stage}>
              <div>
                <strong>{stage} Report:</strong>{" "}
                {isSubmitted ? <span className="submitted-indicator">Submitted</span> : <span className="not-submitted-indicator">Not submitted</span>}
              </div>
              {isSubmitted ? renderFileViewer(stage, fileUrl) : renderNotSubmittedPreview()}
            </li>
          );
        })}
      </ul>

      {isStudent && nextStage && !allSubmitted && (
        <div className="upload-section">
          <h3>Upload {nextStage} Report</h3>
          <form onSubmit={handleUpload} className="tp-upload-form">
            <div className="form-group">
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="tp-file-input" disabled={uploading} />
              <div className="file-format-help">Accepted formats: PDF, DOC, DOCX (Max size: 10MB)</div>
            </div>
            <button type="submit" disabled={uploading || !file} className="tp-button">{uploading ? "Uploading..." : `Upload ${nextStage}`}</button>
            {uploadError && <div className="tp-error">{uploadError}</div>}
          </form>
        </div>
      )}

      {isFaculty && allSubmitted && <div className="tp-all-submitted">This group has completed all progress reports!</div>}
      {isStudent && allSubmitted && <div className="tp-all-submitted">All progress reports submitted! Well done!</div>}
    </div>
  );
}
