import React, { useEffect, useState } from "react";
import "./assign_ra--ta.css";
import api from "../api";

export default function AssignRaTa() {
  const groupId = localStorage.getItem("Group_id");
    const groupIdInt = groupId ? parseInt(groupId) : null;
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
      const session = localStorage.getItem("session");
      const sessionObj = session ? JSON.parse(session) : {};
      const isAllowed = sessionObj.usr_type === "Faculty" || sessionObj.usr_type === "Admin";
        const res = await api.get("/usr");
        const filtered = res.data.filter(
          (u) => u.usr_type === "Ta" || u.usr_type === "Ra"
        );
        setUsers(filtered);
      } catch (err) {
        setError("Failed to load RA/TA list.");
      }
    }
    fetchUsers();
  }, []);

  const handleAssign = async () => {
    setError("");
    setSuccess("");
    setAssigning(true);
    try {
      if (!selectedId) {
        setError("Please select a RA/TA.");
        setAssigning(false);
        return;
      }
        if (!groupIdInt) {
          setError("Invalid group ID.");
          setAssigning(false);
          return;
        }
        await api.put(`/assignhelp/${groupIdInt}`, { id: selectedId });
      setSuccess("RA/TA assigned successfully.");
      localStorage.removeItem("Group_id");
      localStorage.removeItem("stage");
      setTimeout(() => {
        window.location.href = "/groups";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign RA/TA.");
    } finally {
      setAssigning(false);
    }
  };

  const handleViewDetails = async (student_id) => {
    try {
      const res = await api.get(`/usr/${student_id}`);
      setDetails(res.data);
      setShowPopup(true);
    } catch (err) {
      setError("Failed to load details.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setDetails(null);
  };

  return (
    <div className="assign-ra-ta-page">
      <div className="assign-ra-ta-card">
        <h2 className="assign-ra-ta-title">Assign RA/TA to Group <span className="assign-ra-ta-group-id">{groupIdInt || groupId}</span></h2>
        {error && <div className="assign-ra-ta-error">{error}</div>}
        {success && <div className="assign-ra-ta-success">{success}</div>}
        <div className="assign-ra-ta-list">
          <label htmlFor="ra-ta-select" className="assign-ra-ta-label">Select RA/TA:</label>
          <select
            id="ra-ta-select"
            className="assign-ra-ta-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {users.map(u => (
              <option key={u.student_id} value={u.student_id}>
                {u.Name} ({u.usr_type})
              </option>
            ))}
          </select>
        </div>
        <div className="assign-ra-ta-btn-row">
          <button
            className="assign-ra-ta-btn assign-ra-ta-assign-btn"
            onClick={handleAssign}
            disabled={assigning || !selectedId}
          >
            {assigning ? "Assigning..." : "Assign RA/TA"}
          </button>
          {selectedId && (
            <button
              className="assign-ra-ta-btn assign-ra-ta-details-btn"
              onClick={() => handleViewDetails(selectedId)}
            >
              View Details
            </button>
          )}
        </div>
      </div>
      {showPopup && details && (
        <div className="assign-ra-ta-popup">
          <div className="assign-ra-ta-popup-content">
            <h3 className="assign-ra-ta-popup-title">RA/TA Details</h3>
            <p><strong>Name:</strong> {details.Name}</p>
            <p><strong>ID:</strong> {details.student_id}</p>
            <p><strong>Email:</strong> {details.mail}</p>
            <p><strong>Type:</strong> {details.usr_type}</p>
            <button className="assign-ra-ta-btn assign-ra-ta-close-btn" onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
