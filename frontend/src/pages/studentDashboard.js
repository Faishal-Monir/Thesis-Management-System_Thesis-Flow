import { useEffect, useState } from "react";
import "./studentDashboard.css";
import { fetchStudentById } from "../api";


const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    const student_id = "22101744"; // hardcoded for demo, replace as needed
    fetchStudentById(student_id)
      .then((res) => {
        setStudent(res.data.user);
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
          <p><strong>Student ID:</strong> {student.student_id}</p>
          <p><strong>Status:</strong> {student.status === 1 ? "Active" : "Inactive"}</p>
        </div>
      ) : (
        <p className="empty-message">No student found.</p>
      )}
    </div>
  );
};


export default StudentDashboard;