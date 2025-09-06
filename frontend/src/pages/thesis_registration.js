import React, { useEffect, useState } from "react";
import { fetchAllTheses, registerThesis, fetchUserByEmail, fetchGroupByStudentId, checkUserExists } from "../api";
import "./thesis_registration.css";

export default function ThesisRegistration() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false); // New loading state for registration
  const [user, setUser] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedThesis, setSelectedThesis] = useState(""); // New state for dropdown
  const [topic, setTopic] = useState("");
  const [abstract, setAbstract] = useState("");
  const [supervisorMap, setSupervisorMap] = useState({});
  const [rataMap, setRataMap] = useState({});

  useEffect(() => {
    const cachedUser = localStorage.getItem("session");
    if (cachedUser) setUser(JSON.parse(cachedUser));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Fetch theses
        const resTheses = await fetchAllTheses();
        let fetchedTheses = resTheses.data.map(t => ({
          ...t,
          abstract: t.abstract || "N/A",
          student_ids: t.student_ids || [],
        }));
        if (user.usr_type === "Faculty") {
          fetchedTheses = fetchedTheses.filter(t => t.supervisor_id === user.student_id);
        } else if (user.usr_type === "Student") {
          fetchedTheses = fetchedTheses.filter(t => t.student_ids.includes(user.student_id));
        }
        setTheses(fetchedTheses);

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

        // Fetch Ra/Ta names and emails for all theses
        const rataPromises = fetchedTheses.map(async (thesis) => {
          if (thesis.RaTa) {
            const res = await checkUserExists(thesis.RaTa);
            return { [thesis.thesis_id]: { name: res.data.Name, email: res.data.mail } };
          }
          return { [thesis.thesis_id]: { name: "N/A", email: "N/A" } };
        });

        const rataResults = await Promise.all(rataPromises);
        const rataMap = Object.assign({}, ...rataResults);
        setRataMap(rataMap);

        // Fetch group info for current student
        if (user.usr_type === "Student") {
          const resGroup = await fetchGroupByStudentId(user.student_id);
          setGroupInfo(resGroup.data);
        }

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) return (
    <div className="modern-loading-container">
      <div className="modern-spinner"></div>
      <p>Loading theses...</p>
    </div>
  );
  
  if (!user) return (
    <div className="modern-loading-container">
      <p>User not logged in.</p>
    </div>
  );

  const unregisteredGroup = groupInfo && groupInfo.isRegistered === 0 ? groupInfo : null;

  // Filter theses based on selection - Fixed the filter logic
  const displayedTheses = selectedThesis && selectedThesis !== ""
    ? theses.filter(thesis => thesis.thesis_id.toString() === selectedThesis.toString())
    : theses;

  const handleRegisterThesis = async () => {
    if (!unregisteredGroup || !selectedFaculty || !topic || !abstract) {
      alert("Please fill all fields");
      return;
    }

    setRegistering(true); // Start loading

    const requestData = {
      group_id: unregisteredGroup.group_id,
      student_id: selectedFaculty,
      topic: topic.trim(),
      abstract: abstract.trim()
    };

    try {
      const response = await registerThesis(requestData);
      alert("Thesis registered successfully!");
      setShowRegisterForm(false);
      setSelectedFaculty("");
      setTopic("");
      setAbstract("");

      // Refresh theses
      const resTheses = await fetchAllTheses();
      let fetchedTheses = resTheses.data.map(t => ({
        ...t,
        abstract: t.abstract || "N/A",
        student_ids: t.student_ids || [],
      }));
      if (user.usr_type === "Faculty") {
        fetchedTheses = fetchedTheses.filter(t => t.supervisor_id === user.student_id);
      } else if (user.usr_type === "Student") {
        fetchedTheses = fetchedTheses.filter(t => t.student_ids.includes(user.student_id));
      }
      setTheses(fetchedTheses);

      // Refresh group info
      const resGroup = await fetchGroupByStudentId(user.student_id);
      setGroupInfo(resGroup.data);

    } catch (err) {
      console.error("Error registering thesis:", err);
      alert(`Error registering thesis: ${err.message}`);
    } finally {
      setRegistering(false); // End loading
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="modern-container">
      {/* Registration Loading Overlay */}
      {registering && (
        <div className="registration-loading-overlay">
          <div className="registration-loading-content">
            <div className="registration-spinner"></div>
            <h3>Registering Your Thesis</h3>
            <p>Please wait while we process your registration...</p>
          </div>
        </div>
      )}

      <div className="modern-header">
        <h1>
          {user.usr_type === "Faculty" ? "Theses You Supervise" : "Your Thesis Information"}
        </h1>
        <p>Professional thesis registration and tracking platform</p>
      </div>

      {/* Faculty Group Selector - Only show for faculty */}
      {user.usr_type === "Faculty" && theses.length > 0 && (
        <div className="form-field" style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
          <label>Select Thesis Group to View</label>
          <select
            value={selectedThesis}
            onChange={(e) => setSelectedThesis(e.target.value)}
            className="modern-select"
          >
            <option value="">Show All Thesis Groups</option>
            {theses.map((thesis) => (
              <option key={thesis.thesis_id} value={thesis.thesis_id}>
                {thesis.thesis_id} - {thesis.topic.substring(0, 50)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {displayedTheses.length === 0 && (
        <div className="no-thesis-message">
          <p>No thesis found.</p>
        </div>
      )}

      {/* Changed from modern-thesis-grid to modern-thesis-list for serial display */}
      <div className="modern-thesis-list">
        {displayedTheses.map((thesis) => (
          <div key={thesis.thesis_id} className="modern-thesis-card">
            <div className="modern-card-header">
              <div className="thesis-id-badge">THESIS #{thesis.thesis_id}</div>
              <h2 className="thesis-topic">{thesis.topic}</h2>
            </div>
            
            <div className="modern-card-body">
              <div className="modern-info-grid">
                <div className="modern-info-section">
                  <h3>📋 Supervision Details</h3>
                  <div className="info-item">
                    <span className="info-label">Supervisor:</span>
                    <span className="info-value">{supervisorMap[thesis.supervisor_id]?.name || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{supervisorMap[thesis.supervisor_id]?.email || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Supervisor ID:</span>
                    <span className="info-value">{thesis.supervisor_id}</span>
                  </div>
                </div>

                <div className="modern-info-section">
                  <h3>👨‍🎓 Research Assistant</h3>
                  <div className="info-item">
                    <span className="info-label">RA Name:</span>
                    <span className="info-value">{rataMap[thesis.thesis_id]?.name || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{rataMap[thesis.thesis_id]?.email || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value">Active</span>
                  </div>
                </div>
              </div>

              <div className="modern-abstract-section">
                <h3>📄 Abstract</h3>
                <p className="abstract-text">{thesis.abstract}</p>
              </div>

              <div className="modern-progress-section">
                <div className="progress-header">
                  <h3 className="progress-title">Progress Status</h3>
                  <div className="progress-percentage">
                    {Math.round(((thesis.progress || 0) / 3) * 100)}%
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${((thesis.progress || 0) / 3) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-stages">
                  {['P1', 'P2', 'P3'].map((stage, index) => (
                    <div 
                      key={stage} 
                      className={`stage ${(thesis.progress || 0) > index ? 'completed' : 'pending'}`}
                    >
                      {stage} {(thesis.progress || 0) > index ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              {thesis.feedback && (
                <div className="modern-feedback-section">
                  <h3>💬 Feedback</h3>
                  {typeof thesis.feedback === "object" ? (
                    <div className="feedback-list">
                      {Object.entries(thesis.feedback).map(([stage, feedback]) => (
                        <div key={stage} className="feedback-item">
                          <strong>{stage}:</strong> {feedback}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="feedback-text">{thesis.feedback || "No feedback yet"}</p>
                  )}
                </div>
              )}

              {thesis.students && thesis.students.length > 0 && (
                <div className="modern-members-section">
                  <h3 className="members-header">👥 Group Members</h3>
                  {thesis.students.map((student) => (
                    <div key={student.student_id} className="member-card">
                      <div className="member-avatar">{getInitials(student.Name)}</div>
                      <div className="member-info">
                        <div className="member-name">{student.Name}</div>
                        <div className="member-details">{student.mail} • ID: {student.student_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="status-badges">
                <div className={`badge ${thesis.defer_status === "approved" ? "badge-defer-yes" : "badge-defer-no"}`}>
                  {thesis.defer_status === "approved" ? "Deferred" : "No Deferral"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {unregisteredGroup && !showRegisterForm && (
        <div className="register-button-container">
          <button
            className="modern-register-btn"
            onClick={() => setShowRegisterForm(true)}
          >
            + Register New Thesis
          </button>
        </div>
      )}

      {showRegisterForm && unregisteredGroup && (
        <div className="modern-register-form">
          <div className="form-header">
            <h3>Register New Thesis</h3>
            <p>Fill in the details to register your thesis</p>
          </div>
          
          <div className="form-field">
            <label>Group ID</label>
            <input
              type="text"
              value={unregisteredGroup.group_id}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-field">
            <label>Select Faculty Supervisor</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="modern-select"
            >
              <option value="">Choose a faculty member...</option>
              {faculties.map((faculty) => (
                <option key={faculty.student_id} value={faculty.student_id}>
                  {faculty.Name} ({faculty.student_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Thesis Topic</label>
            <input
              type="text"
              placeholder="Enter your thesis topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="modern-input"
            />
          </div>

          <div className="form-field">
            <label>Abstract</label>
            <textarea
              placeholder="Provide a detailed abstract of your thesis..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="modern-textarea"
            />
          </div>

          <div className="form-actions">
            <button
              className="submit-btn"
              onClick={handleRegisterThesis}
              disabled={registering}
            >
              {registering ? "Registering..." : "Register Thesis"}
            </button>
            <button
              onClick={() => setShowRegisterForm(false)}
              className="cancel-btn"
              disabled={registering}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}