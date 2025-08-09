import { useEffect, useState } from "react";
import "./studentProposal.css";
import {
  fetchAllProposals,
  fetchProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  fetchStudentById
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


  useEffect(() => {
    // Get logged in user info
    const cached = JSON.parse(localStorage.getItem('session') || '{}');
    const student_id = cached.student_id;
    fetchStudentById(student_id)
      .then((res) => {
        setUserType(res.data.role);
        setLoggedStudentId(student_id);
        fetchProposals();
      })
      .catch(() => {
        fetchProposals();
      });
  }, []);


  const fetchProposals = async () => {
    try {
      const res = await fetchAllProposals();
      setProposals(res.data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  };


  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!studentId || !domain || !idea) {
      showToastMessage("All fields are required.");
      return;
    }


    const isConfirmed = window.confirm("Are you sure you want to add a new proposal?");
    if (!isConfirmed) return;


    // Check for duplicates
    const exists = proposals.some(
      (p) =>
        p.student_id === studentId.trim()  
    );


    if (exists) {
      showToastMessage("Proposal with same ID already exists.");
      return;
    }


    try {
      const res = await createProposal({
        student_id: studentId,
        domain,
        idea,
      });


      setStudentId("");
      setDomain("");
      setIdea("");
      setShowForm(false);
      showToastMessage("Proposal added successfully.");
      fetchProposals();
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
      fetchProposals();
    } catch (err) {
      showToastMessage(err.response?.data?.error || err.message);
    }
  };


  return (
    <div className="proposal-container">
      <h1 className="proposal-title">Student Thesis Proposals</h1>
      {showToast && (
        <div className={`toast ${toastMessage.toLowerCase().includes('successfully') ? 'success' : ''}`}>{toastMessage}</div>
      )}
      <div className="proposal-list">
        {proposals.length === 0 ? (
          <p className="no-proposals">No proposals found.</p>
        ) : (
          userType === "Faculty" ? (
            // Faculty sees all proposals
            proposals.map((p, index) => (
              <div key={p._id} className="proposal-card">
                <p><strong>ID:</strong> {p.student_id}</p>
                <p><strong>Domain:</strong> {p.domain}</p>
                <p><strong>Idea:</strong> {p.idea}</p>
                <p><strong>Status:</strong> {p.status}</p>
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
                      <input className="edit-input" type="text" placeholder="Domain" value={editDomain} onChange={(e) => setEditDomain(e.target.value)} />
                      <input className="edit-input" type="text" placeholder="Idea" value={editIdea} onChange={(e) => setEditIdea(e.target.value)} />
                      <div className="button-group">
                        <button className="btn update-btn" onClick={() => handleUpdate(p._id)}>Submit Update</button>
                        <button className="btn cancel-btn" onClick={() => setEditIndex(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><strong>Domain:</strong> {p.domain}</p>
                      <p><strong>Idea:</strong> {p.idea}</p>
                      <p><strong>Status:</strong> {p.status}</p>
                      <button className="btn update-btn" onClick={() => {
                        setEditIndex(index);
                        setEditDomain(p.domain);
                        setEditIdea(p.idea);
                      }}>Update</button>
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
            <input className="form-input" type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
            <input className="form-input" type="text" placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} required />
            <input className="form-input" type="text" placeholder="Idea" value={idea} onChange={(e) => setIdea(e.target.value)} required />
            <div className="button-group">
              <button type="submit" className="btn submit-btn">Submit</button>
              <button type="button" className="btn cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className="btn add-btn" onClick={() => setShowForm(true)}>Add Proposal</button>
        )
      )}
    </div>
  );
};


export default StudentProposal;