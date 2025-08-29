import React, { useEffect, useState } from "react";
import { fetchThesisByIdAPI, uploadThesisProgressAPI } from "../api";
import "./thesis_progress.css";

export default function ThesisProgress() {
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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

        // Fetch the thesis data first (keeping original logic)
        const thesisId = 1; // Keep the original hardcoded ID
        const data = await fetchThesisByIdAPI(thesisId);
        
        if (!data) {
          setError("No thesis data available.");
          setLoading(false);
          return;
        }

        // Now check access based on user type
        if (session.usr_type === "Student") {
          // Check if this student is part of this thesis group
          if (!session.student_id) {
            setError("Student ID not found. Please contact admin.");
            setLoading(false);
            return;
          }
          
          // Check if student_id is in the thesis student_ids array
          if (!data.student_ids || !data.student_ids.includes(session.student_id)) {
            setError("You are not part of any registered thesis group.");
            setLoading(false);
            return;
          }
          
          // Student has access
          setThesis(data);
          
        } else if (session.usr_type === "Faculty") {
          // Check if this faculty member is the supervisor of this thesis
          if (data.supervisor_id !== session.student_id) {
            setError("Access denied. You are not the supervisor of this thesis group.");
            setLoading(false);
            return;
          }
          
          // Faculty has access
          setThesis(data);
          
        } else {
          setError("Access denied. Only students and faculty can view thesis progress.");
          setLoading(false);
          return;
        }
        
      } catch (err) {
        setError(err.message || "Failed to load thesis data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Fixed: removed 'session' from dependency array

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

  const nextStage = thesis ? getNextStage(thesis.progress) : "";
  const allSubmitted = thesis && thesis.progress >= 3;
  const isStudent = session?.usr_type === "Student";
  const isFaculty = session?.usr_type === "Faculty";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadError("");
    
    // Validate file size (10MB limit)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      setFile(null);
      e.target.value = "";
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Only students can upload
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

    // Show confirmation popup
    const confirmed = window.confirm("Are you sure you want to Upload?");
    if (!confirmed) {
      return;
    }

    setUploading(true);
    setUploadError("");
    
    try {
      const formData = new FormData();
      formData.append("report", file);
      formData.append("stage", nextStage);

      const updatedThesis = await uploadThesisProgressAPI(thesis.thesis_id, formData);
      setThesis(updatedThesis);
      setFile(null);
      
      // Reset file input
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
            <object 
              data={fileUrl} 
              type="application/pdf" 
              width="100%" 
              height="400px"
              style={{ borderRadius: "4px" }}
            >
              <p>
                PDF cannot be displayed in this browser. 
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
          {/* Download button visible to Faculty */}
          {isFaculty && (
            <div style={{ margin: "10px",textAlign: "center" }}>
              <button
                className="tp-button"
                onClick={async () => {
                  try {
                    const response = await fetch(fileUrl, {
                      method: "GET",
                      headers: {
                        // optional: send token if your API needs auth
                        // "Authorization": `Bearer ${session.token}`
                      }
                    });

                    if (!response.ok) throw new Error("Failed to download file");

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert("Download failed: " + err.message);
                  }
                }}
              >
                ⬇️ Download
              </button>
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

  if (loading) {
    return (
      <div className="resources-container">
        <div className="tp-loading">Loading thesis progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resources-container">
        <div className="tp-error">{error}</div>
      </div>
    );
  }

  if (!thesis) {
    return (
      <div className="resources-container">
        <p>No thesis data available.</p>
      </div>
    );
  }

  const containerClass = allSubmitted ? "resources-container completed" : "resources-container";
  const progressClass = allSubmitted ? "progress-indicator completed" : "progress-indicator";

  return (
    <div className={containerClass}>
      <h2>Thesis Progress - Group {thesis.group_id}</h2>
      <p><strong>Topic:</strong> {thesis.topic}</p>
      <p><strong>Supervisor:</strong> {thesis.supervisor_id}</p>
      {thesis.student_ids && (
        <p><strong>Group Members:</strong> {thesis.student_ids.join(", ")}</p>
      )}
      <p>
        <strong>Current Stage:</strong> 
        <span className={progressClass}>
          {allSubmitted ? "Completed" : getProgressLabel(thesis.progress)}
        </span>
      </p>
      
      {isFaculty && (
        <div className="faculty-view-indicator" style={{ 
          backgroundColor: "#e3f2fd", 
          padding: "10px", 
          borderRadius: "5px", 
          marginBottom: "15px",
          border: "1px solid #2196f3"
        }}>
          <p><strong>Faculty View:</strong> You are viewing this group's progress as their supervisor.</p>
        </div>
      )}

      <h3>Reports</h3>
      <ul>
        {["P1", "P2", "P3"].map(stage => {
          const fileUrl = thesis.reports[stage] ? `${API_BASE_URL}${thesis.reports[stage]}` : null;
          const isSubmitted = !!fileUrl;
          
          return (
            <li key={stage}>
              <div>
                <strong>{stage} Report:</strong>{" "}
                {isSubmitted ? (
                  <span className="submitted-indicator">Submitted</span>
                ) : (
                  <span className="not-submitted-indicator">Not submitted</span>
                )}
              </div>
              
              {isSubmitted ? renderFileViewer(stage, fileUrl) : renderNotSubmittedPreview()}
            </li>
          );
        })}
      </ul>

      {/* Upload section - only show for students */}
      {isStudent && nextStage && !allSubmitted && (
        <div className="upload-section">
          <h3>Upload {nextStage} Report</h3>
          <form onSubmit={handleUpload} className="tp-upload-form">
            <div className="form-group">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange}
                className="tp-file-input"
                disabled={uploading}
              />
              <div className="file-format-help">
                Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={uploading || !file} 
              className="tp-button"
            >
              {uploading ? "Uploading..." : `Upload ${nextStage}`}
            </button>
            
            {uploadError && <div className="tp-error">{uploadError}</div>}
          </form>
        </div>
      )}

      {/* Faculty view message for completed theses */}
      {isFaculty && allSubmitted && (
        <div className="tp-all-submitted">
          This group has completed all progress reports!
        </div>
      )}

      {/* Student view message for completed theses */}
      {isStudent && allSubmitted && (
        <div className="tp-all-submitted">
          All progress reports submitted! Well done!
        </div>
      )}
    </div>
  );
}