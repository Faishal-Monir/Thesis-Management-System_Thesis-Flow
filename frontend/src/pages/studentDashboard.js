import { useEffect, useState } from "react";
import "./studentDashboard.css";
import { fetchStudentById } from "../api";


const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState(null);


  useEffect(() => {
    // Get cached student info
    const cached = JSON.parse(localStorage.getItem('session') || '{}');
    const student_id = cached.student_id; // fallback if not found
    fetchStudentById(student_id)
      .then((res) => {
        setStudent(res.data.user);
        setRole(res.data.role);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch student");
      });
  }, []);


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">User Dashboard</h1>


      {error && <p className="dashboard-error">{error}</p>}


      {student ? (
        <div className="student-card">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>{role === "Faculty" ? "Faculty ID" : "Student ID"}:</strong> {student.student_id}</p>
          <p><strong>Status:</strong> {student.status === 1 ? "Active" : "Inactive"}</p>
        </div>
      ) : (
        <p className="empty-message">No student found.</p>
      )}
    </div>
  );
};


export default StudentDashboard;