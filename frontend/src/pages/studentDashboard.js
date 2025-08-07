import { useEffect, useState } from "react";
import "./studentDashboard.css";


const StudentDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);


  const fetchAllUsers = async () => {
    try {
      const res = await fetch("/users/dashboard");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };


  useEffect(() => {
    fetchAllUsers();
  }, []);


  const students = users.filter((u) => u.usr_type === "Student");
  const faculty = users.filter((u) => u.usr_type === "Faculty");


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">User Dashboard</h1>


      {error && <p className="dashboard-error">{error}</p>}


      <section>
        <h2 className="section-title">Students</h2>
        {students.length === 0 ? (
          <p className="empty-message">No students found.</p>
        ) : (
          students.map((student) => (
            <div key={student._id} className="student-card">
              <p><strong>Name:</strong> {student.Name}</p>
              <p><strong>Email:</strong> {student.mail}</p>
              <p><strong>Student ID:</strong> {student.student_id}</p>
            </div>
          ))
        )}
      </section>


      <section className="faculty-section">
        <h2 className="section-title">Faculty</h2>
        {faculty.length === 0 ? (
          <p className="empty-message">No faculty members found.</p>
        ) : (
          faculty.map((fac) => (
            <div key={fac._id} className="faculty-card">
              <p><strong>Name:</strong> {fac.Name}</p>
              <p><strong>Email:</strong> {fac.mail}</p>
              <p><strong>Faculty ID:</strong> {fac.student_id}</p>
              <p><strong>Status:</strong> {fac.status === 1 ? "Active" : "Inactive"}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};


export default StudentDashboard;