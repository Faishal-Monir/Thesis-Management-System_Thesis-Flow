import { useEffect, useState } from "react";
import "./studentProposal.css";
import {
  fetchAllProposals,
  fetchProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  fetchStudentById,
  fetchDomainList,
  updateProposalStatus
} from "../api";

const StudentProposal = () => {
  const [proposals, setProposals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [domain, setDomain] = useState("");
  const [idea, setIdea] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editDomain, setEditDomain] = useState("");
  const [editIdea, setEditIdea] = useState("");
  const [userType, setUserType] = useState("");
  const [loggedStudentId, setLoggedStudentId] = useState("");
  const [loggedUserData, setLoggedUserData] = useState({}); // Store full user data
  const [userMap, setUserMap] = useState({}); // { student_id: name }

  // State for domain list
  const [domains, setDomains] = useState([]);
  
  // State for faculty filter
  const [selectedDomain, setSelectedDomain] = useState("");

  // State for status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    // Get logged in user info
    const cached = JSON.parse(localStorage.getItem('session') || '{}');
    const student_id = cached.student_id;
    
    // Set user data directly from localStorage
    setLoggedUserData(cached);
    setUserType(cached.usr_type || '');
    setLoggedStudentId(student_id);
    
    // Fetch additional user details if needed
    if (student_id) {
      fetchStudentById(student_id)
        .then((res) => {
          // Update with any additional data from API if needed
          const combinedData = { ...cached, ...res.data };
          setLoggedUserData(combinedData);
          
          // Fetch proposals with faculty_id if user is faculty
          if (cached.usr_type === "Faculty") {
            fetchProposalsForFaculty(student_id);
          } else {
            fetchProposals();
          }
        })
        .catch(() => {
          // If API fails, still proceed with cached data
          if (cached.usr_type === "Faculty") {
            fetchProposalsForFaculty(student_id);
          } else {
            fetchProposals();
          }
        });
    }

    // Fetch domains dynamically
    const getDomains = async () => {
      try {
        const res = await fetchDomainList();
        const sortedDomains = (res.data.domains || []).sort((a, b) =>
          a.domain_subject.localeCompare(b.domain_subject)
        );
        setDomains(sortedDomains);
      } catch (err) {
        console.error("Error fetching domains:", err);
      }
    };
    getDomains();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetchAllProposals();
      const proposalsData = res.data;
      setProposals(proposalsData);
      await fetchUserNames(proposalsData);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };

  const fetchProposalsForFaculty = async (facultyId) => {
    try {
      console.log("Fetching proposals for faculty ID:", facultyId);
      const res = await fetchAllProposals(facultyId);
      const proposalsData = res.data;
      console.log("Received proposals:", proposalsData);
      setProposals(proposalsData);
      await fetchUserNames(proposalsData);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };
  

  const fetchUserNames = async (proposalsData) => {
    // Collect all updated_by faculty IDs
    const facultyIds = proposalsData
      .map(p => p.updated_by?.faculty_id)
      .filter(id => id); // remove null/undefined

    // Fetch names for these IDs
    const uniqueIds = [...new Set(facultyIds)];
    const idNameMap = {};

    await Promise.all(uniqueIds.map(async (id) => {
      try {
        const res = await fetchStudentById(id);
        idNameMap[id] = {
          name: res.data.Name,
          email: res.data.Email
        };
      } catch (err) {
        idNameMap[id] = {
          name: id,
          email: 'N/A'
        };
      }
    }));

    setUserMap(idNameMap);
  };

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!domain || !idea) {
      showToastMessage("All fields are required.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to add a new proposal?");
    if (!isConfirmed) return;



    // Check for duplicates
    const exists = proposals.some(
      (p) => p.student_id === loggedStudentId.trim()  
    );

    if (exists) {
      showToastMessage("Proposal with same ID already exists.");
      return;
    }

    try {                                    
      await createProposal({
        student_id: loggedStudentId,
        domain,
        idea,
      });

      setStudentId("");
      setDomain("");
      setIdea("");
      setShowForm(false);
      showToastMessage("Proposal added successfully.");
      
      if (userType === "Faculty") {
        fetchProposalsForFaculty(loggedStudentId);
      } else {
        fetchProposals();
      }
    } catch (err) {
      showToastMessage(err.response?.data?.error || err.message);
    }
  };

  const handleUpdate = async (id) => {
    if (!editDomain || !editIdea) {
      showToastMessage("Both domain and idea are required for update.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to update this proposal?");
    if (!isConfirmed) return;

    try {
      await updateProposal(id, {
        domain: editDomain,
        idea: editIdea,
      });
      showToastMessage("Proposal updated successfully.");
      setEditIndex(null);
      setEditDomain("");
      setEditIdea("");
      
      if (userType === "Faculty") {
        fetchProposalsForFaculty(loggedStudentId);
      } else {
        fetchProposals();
      }
    } catch (err) {
      showToastMessage(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this proposal? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      await deleteProposal(id);
      showToastMessage("Proposal deleted successfully.");
      
      if (userType === "Faculty") {
        fetchProposalsForFaculty(loggedStudentId);
      } else {
        fetchProposals();
      }
    } catch (err) {
      showToastMessage(err.response?.data?.error || err.message);
    }
  };

  const handleStatusUpdate = (proposalId) => {
    setSelectedProposalId(proposalId);
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedStatus) {
      showToastMessage("Please select a status.");
      return;
    }

    const requestData = {
      status: selectedStatus,
      faculty_id: loggedStudentId,
      name: loggedUserData.Name || 'Unknown',
      email: loggedUserData.mail || loggedUserData.Email || loggedUserData.email || 'unknown@email.com'
    };

    // Validate required fields
    if (!requestData.faculty_id || !requestData.name || !requestData.email) {
      showToastMessage("Missing required user information. Please log in again.");
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to mark this proposal as ${selectedStatus}?`);
    if (!isConfirmed) return;

    try {
      await updateProposalStatus(selectedProposalId, requestData);

      showToastMessage(`Proposal ${selectedStatus.toLowerCase()} successfully.`);
      setShowStatusModal(false);
      setSelectedStatus("");
      setSelectedProposalId("");
      
      // Refresh proposals for faculty
      if (userType === "Faculty") {
        fetchProposalsForFaculty(loggedStudentId);
      } else {
        fetchProposals();
      }
    } catch (err) {
      showToastMessage(err.response?.data?.error || "Error updating proposal status");
    }
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedStatus("");
    setSelectedProposalId("");
  };

  // Filter proposals for faculty if a domain is selected
  const filteredProposals = selectedDomain
    ? proposals.filter(p => p.domain === selectedDomain)
    : proposals;

  return (
    <div className="proposal-container">
      <h1 className="proposal-title">Student Thesis Proposals</h1>
      {showToast && (
        <div className={`toast ${toastMessage.toLowerCase().includes('successfully') ? 'success' : ''}`}>
          {toastMessage}
        </div>
      )}
      
      {/* Faculty Domain Filter Dropdown */}
      {userType === "Faculty" && (
        <div className="faculty-filter">
          <select
            className="form-input"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="">All Domains</option>
            {domains.map((d) => (
              <option key={d.id_no} value={d.domain_subject}>
                {d.domain_subject}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Proposal Status</h3>
            <div className="status-options">
              <label>
                <input
                  type="radio"
                  value="Interested"
                  checked={selectedStatus === "Interested"}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                Interested
              </label>
              <label>
                <input
                  type="radio"
                  value="Approved"
                  checked={selectedStatus === "Approved"}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                Approved
              </label>
              <label>
                <input
                  type="radio"
                  value="Rejected"
                  checked={selectedStatus === "Rejected"}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                Rejected
              </label>
            </div>
            <div className="modal-buttons">
              <button className="btn submit-btn" onClick={submitStatusUpdate}>
                Update Status
              </button>
              <button className="btn cancel-btn" onClick={closeStatusModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="proposal-list">
        {proposals.length === 0 ? (
          <p className="no-proposals">No proposals found.</p>
        ) : (
          userType === "Faculty" ? (
            // Faculty sees all proposals (filtered) - excludes those approved by other faculty
            filteredProposals.map((p, index) => (
              <div key={p._id} className="proposal-card">
                <p><strong>ID:</strong> {p.student_id}</p>
                <p><strong>Domain:</strong> {p.domain}</p>
                <p><strong>Idea:</strong> {p.idea}</p>
                <p><strong>Status:</strong> {p.status}</p>
                {p.updated_by?.faculty_id && (
                  <div>
                    <p><strong>Updated By:</strong></p>
                    <p style={{marginLeft: '20px'}}>
                      <strong>Name:</strong> {userMap[p.updated_by.faculty_id]?.name || p.updated_by.name || 'N/A'}
                    </p>
                    <p style={{marginLeft: '20px'}}>
                      <strong>Email:</strong> {userMap[p.updated_by.faculty_id]?.email || p.updated_by.email || 'N/A'}
                    </p>
                  </div>
                )}
                {p.status !== "Approved" || (p.status === "Approved" && p.updated_by?.faculty_id === loggedStudentId) ? (
                  <button 
                    className="btn update-status-btn" 
                    onClick={() => handleStatusUpdate(p._id)}
                  >
                    Update Status
                  </button>
                ) : null}
              </div>
            ))
          ) : (
            // Student sees only their proposal, can update or submit
            proposals.filter(p => p.student_id === loggedStudentId).length > 0 ? (
              proposals.filter(p => p.student_id === loggedStudentId).map((p, index) => (
                <div key={p._id} className="proposal-card">
                  <p><strong>ID:</strong> {p.student_id}</p>
                  {editIndex === index ? (
                    <>
                      <select
                        className="edit-input"
                        value={editDomain}
                        onChange={(e) => setEditDomain(e.target.value)}
                        required
                      >
                        <option value="">Select Domain</option>
                        {domains.map((d) => (
                          <option key={d.id_no} value={d.domain_subject}>
                            {d.domain_subject}
                          </option>
                        ))}
                      </select>
                      <input 
                        className="edit-input" 
                        type="text" 
                        placeholder="Idea" 
                        value={editIdea} 
                        onChange={(e) => setEditIdea(e.target.value)} 
                      />
                      <div className="button-group">
                        <button className="btn update-btn" onClick={() => handleUpdate(p._id)}>
                          Submit Update
                        </button>
                        <button className="btn cancel-btn" onClick={() => setEditIndex(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Domain:</strong> {p.domain}</p>
                      <p><strong>Idea:</strong> {p.idea}</p>
                      <p><strong>Status:</strong> {p.status}</p>
                      {p.updated_by?.faculty_id && (
                        <div>
                          <p><strong>Faculty Details:</strong></p>
                          <p style={{marginLeft: '20px'}}>
                            <strong>ID:</strong> {p.updated_by.faculty_id}
                          </p>
                          <p style={{marginLeft: '20px'}}>
                            <strong>Name:</strong> {userMap[p.updated_by.faculty_id]?.name || p.updated_by.name || 'N/A'}
                          </p>
                          <p style={{marginLeft: '20px'}}>
                            <strong>Email:</strong> {userMap[p.updated_by.faculty_id]?.email || p.updated_by.email || 'N/A'}
                          </p>
                        </div>
                      )}
                      <div className="button-group">
                        {p.status === 'Pending'  && (
                          <button className="btn update-btn" onClick={() => {
                            setEditIndex(index);
                            setEditDomain(p.domain);
                            setEditIdea(p.idea);
                          }}>
                            Update
                          </button>
                        )}
                        {(!p.updated_by?.faculty_id || p.status === 'Rejected') && (
                          <button className="btn delete-btn" onClick={() => handleDelete(p._id)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              // Student can submit if no proposal exists
              <p className="no-proposals">No proposal found. Please submit your proposal.</p>
            )
          )
        )}
      </div>

      {/* Only show add form for students who have not submitted */}
      {userType === "Student" && proposals.filter(p => p.student_id === loggedStudentId).length === 0 && (
        showForm ? (
          <form className="proposal-form" onSubmit={handleSubmit}>
            {/* <input 
              className="form-input" 
              type="text" 
              placeholder="Student ID" 
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)} 
              required 
            /> */}
            <p className="form-input"><strong>ID:</strong> {loggedStudentId}</p> {/* New Proposal auto-filled */}
            <input 
              type="hidden" 
              name="student_id" 
              value={loggedStudentId} 
            />
            {/* Domain dropdown */}
            <select
              className="form-input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            >
              <option value="">Select Domain</option>
              {domains.map((d) => (
                <option key={d.id_no} value={d.domain_subject}>
                  {d.domain_subject}
                </option>
              ))}
            </select>

            <input 
              className="form-input" 
              type="text" 
              placeholder="Idea" 
              value={idea} 
              onChange={(e) => setIdea(e.target.value)} 
              required 
            />
            <div className="button-group">
              <button type="submit" className="btn submit-btn">Submit</button>
              <button type="button" className="btn cancel-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="btn add-btn" onClick={() => setShowForm(true)}>
            Add Proposal
          </button>
        )
      )}
    </div>
  );
};

export default StudentProposal;