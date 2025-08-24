import React, { useEffect, useState } from "react";
import "./thesis_registration.css";
import { fetchAllTheses, registerThesis, fetchUserByEmail, fetchGroupByStudentId } from "../api";

export default function ThesisRegistration() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null); // store group info
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [topic, setTopic] = useState("");
  const [abstract, setAbstract] = useState("");

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

        // Fetch group info for current student
        if (user.usr_type === "Student") {
          const resGroup = await fetchGroupByStudentId(user.student_id);
          setGroupInfo(resGroup.data); // { group_id, isRegistered }
        }

      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) return <p className="p-6">Loading theses...</p>;
  if (!user) return <p className="p-6">User not logged in.</p>;

  const unregisteredGroup = groupInfo && groupInfo.isRegistered === 0 ? groupInfo : null;

  const handleRegisterThesis = async () => {
    if (!unregisteredGroup || !selectedFaculty || !topic || !abstract) {
      alert("Please fill all fields");
      return;
    }

    // Log the data being sent
    const requestData = {
      group_id: unregisteredGroup.group_id,
      student_id: selectedFaculty,
      topic: topic.trim(),
      abstract: abstract.trim()
    };

    console.log("Sending thesis registration data:", requestData);
    console.log("Group info:", unregisteredGroup);
    console.log("Selected faculty:", selectedFaculty);

    try {
      const response = await registerThesis(requestData);
      console.log("Registration response:", response);
      
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
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      console.error("Error config:", err.config);
      console.error("Error message:", err.message);
      
      // Log the URL being called
      if (err.config) {
        console.error("Request URL:", err.config.url);
        console.error("Request method:", err.config.method);
        console.error("Request data:", err.config.data);
      }
      
      // More specific error messages
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        alert(`Error registering thesis: ${err.response.data?.error || err.response.statusText} (Status: ${err.response.status})`);
      } else if (err.request) {
        alert("Error: No response from server. Please check your connection.");
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-6 mt-navbar max-w-5xl mx-auto" style={{marginTop: '100px',maxWidth: '700px'}}>
      <h2 className="text-xl font-bold mb-4">
        {user.usr_type === "Faculty" ? "Theses You Supervise" : "Your Thesis Information"}
      </h2>

      {/* Thesis list */}
      {theses.length === 0 && <p>No thesis found.</p>}
      {theses.map((thesis) => (
        <div key={thesis.thesis_id} className="border p-3 rounded mb-3">
          <h3 className="font-semibold">
            Thesis ID: {thesis.thesis_id} | Topic: {thesis.topic}
          </h3>
          <p><strong>Abstract:</strong> {thesis.abstract}</p>
          <p><strong>Progress:</strong> {thesis.progress || 0} / 3</p>
          <p><strong>Supervisor:</strong> {thesis.supervisor_id}</p>
          <p><strong>Feedback:</strong> {thesis.feedback || "No feedback yet"}</p>
          <p><strong>RaTa:</strong> {thesis.RaTa || "N/A"}</p>

          {thesis.students && thesis.students.length > 0 && (
            <div className="mt-2">
              <strong>Group Members:</strong>
              <ul className="ml-4">
                {thesis.students.map((s) => (
                  <li key={s.student_id}>{s.Name} ({s.mail}) - ID: {s.student_id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Thesis Registration Button */}
      {unregisteredGroup && !showRegisterForm && (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={() => setShowRegisterForm(true)}
        >
          Thesis Registration
        </button>
        
        
      )}

      {showRegisterForm && unregisteredGroup && (
        <div className="border p-4 rounded mt-4">
          <h3 className="font-semibold mb-2">Register New Thesis</h3>

          <input
            type="text"
            value={unregisteredGroup.group_id}
            readOnly
            className="border p-2 mb-2 w-full bg-gray-100 font-semibold"
          />

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="border p-2 mb-2 w-full"
          >
            <option value="">Select Faculty</option>
            {faculties.map((f) => (
              <option key={f.student_id} value={f.student_id}>
                {f.Name} ({f.student_id})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Thesis Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <textarea
            placeholder="Abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="border p-2 mb-2 w-full"
          />

          <button
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 block"
            onClick={handleRegisterThesis}
          >
            Register Thesis
          </button>
          {/* Back button below Create Group */}
          <button
            onClick={() => setShowRegisterForm(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-2 block"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}