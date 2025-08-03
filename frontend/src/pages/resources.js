import { useEffect, useState } from "react";
import "./resources.css";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/resources");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLink.trim()) {
      setError("Please enter a link");
      return;
    }
  
    // Check for duplicate (case-insensitive)
    const linkExists = resources.some(resource =>
      resource.links.some(link => link.toLowerCase() === newLink.trim().toLowerCase())
    );
  
    if (linkExists) {
      setError("Resource Already Exists");
      setSuccessMsg("");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
  
    setError(null);
    setLoading(true);
  
    try {
      const response = await fetch("/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: [newLink.trim()] }),
      });
  
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to add link");
      }
  
      const newResource = await response.json();
      setNewLink("");
      setResources((prevResources) => [...prevResources, newResource]);
  
      setSuccessMsg("New Resources Added");
      setError(null);
      setTimeout(() => setSuccessMsg(""), 3000);
  
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="resources-container">
      <h1 className="resources-title">Thesis Resources</h1>

      {/* Success popup */}
      {successMsg && <div className="success-popup">{successMsg}</div>}
      {error && <div className="error-popup">{error}</div>}

      <form onSubmit={handleSubmit} className="resources-form">
        <input
          type="url"
          placeholder="Enter resource link"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          className="resources-input"
          required
        />
        <button type="submit" disabled={loading} className="resources-button">
          {loading ? "Adding..." : "Add Link"}
        </button>
      </form>

      {error && <p className="resources-error">{error}</p>}

      <ul className="resources-list">
        {resources.length === 0 ? (
          <li className="resources-empty">No resources found.</li>
        ) : (
          resources.map(({ _id, links }) => (
            <li key={_id} className="resource-item">
              <ul className="resource-links">
                {(links || []).map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="resource-link">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Resources;
