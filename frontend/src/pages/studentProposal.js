import { useEffect, useState } from "react";
import "./studentProposal.css";


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


  useEffect(() => {
    fetchProposals();
  }, []);


  const fetchProposals = async () => {
    try {
      const res = await fetch("/students/propose");
      const data = await res.json();
      setProposals(data);
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
      const res = await fetch("/students/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          domain,
          idea,
        }),
      });


      const data = await res.json();


      if (!res.ok) throw new Error(data.error || "Failed to submit proposal");


      setStudentId("");
      setDomain("");
      setIdea("");
      setShowForm(false);
      showToastMessage("Proposal added successfully.");
      fetchProposals();
    } catch (err) {
      showToastMessage(err.message);
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
      const res = await fetch(`/students/propose/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: editDomain,
          idea: editIdea,
        }),
      });


      const data = await res.json();


      if (!res.ok) throw new Error(data.error || "Failed to update proposal.");


      showToastMessage("Proposal updated successfully.");
      setEditIndex(null);
      setEditDomain("");
      setEditIdea("");
      fetchProposals();
    } catch (err) {
      showToastMessage(err.message);
    }
  };


  return (
    <div className="proposal-container">
      <h1 className="proposal-title">Student Thesis Proposals</h1>
 
      {showToast && (
        <div
          className={`toast ${
            toastMessage.toLowerCase().includes('successfully') ? 'success' : ''
          }`}
        >
          {toastMessage}
        </div>
      )}


 
      <div className="proposal-list">
        {proposals.length === 0 ? (
          <p className="no-proposals">No proposals found.</p>
        ) : (
          proposals.map((p, index) => (
            <div key={p._id} className="proposal-card">
              <p><strong>ID:</strong> {p.student_id}</p>
 
              {editIndex === index ? (
                <>
                  <input
                    className="edit-input"
                    type="text"
                    placeholder="Domain"
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                  />
                  <input
                    className="edit-input"
                    type="text"
                    placeholder="Idea"
                    value={editIdea}
                    onChange={(e) => setEditIdea(e.target.value)}
                  />
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
                  }}>
                    Update
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
 
      {!showForm && (
        <button className="btn add-btn" onClick={() => setShowForm(true)}>
          Add Proposal
        </button>
      )}
 
      {showForm && (
        <form className="proposal-form" onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="text"
            placeholder="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />
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
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
 
};


export default StudentProposal;