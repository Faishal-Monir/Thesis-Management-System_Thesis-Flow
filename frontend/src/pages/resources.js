import { useEffect, useState } from "react";
import "./resources.css";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [newLink, setNewLink] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [updatedLink, setUpdatedLink] = useState("");


  useEffect(() => {
    fetchResources();
  }, []);

  // Handle updating a resource link
  const handleUpdate = async (resourceId, oldLinks) => {
    const currentLink = oldLinks[0] || "";
    const newLink = prompt("Enter the updated link:", currentLink);
  
    if (!newLink || newLink.trim() === currentLink.trim()) return;
  
    try {
      const response = await fetch(`/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: [newLink.trim()] }),
      });
  
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update resource");
      }
  
      const result = await response.json();
      setResources((prevResources) =>
        prevResources.map((res) =>
          res._id === resourceId ? result.resource : res
        )
      );
  
      setSuccessMsg("Resource updated successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle updating a resource link with form input
  const submitUpdate = async (resourceId) => {
    if (!updatedLink.trim()) {
      setError("Please enter a valid link");
      return;
    }
  
    try {
      const response = await fetch(`/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: [updatedLink.trim()] }),
      });
  
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update resource");
      }
  
      const result = await response.json();
      setResources((prevResources) =>
        prevResources.map((res) =>
          res._id === resourceId ? result.resource : res
        )
      );
  
      setSuccessMsg("Resource updated successfully");
      setEditingResourceId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };
  

  // Fetch all resources from the server
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

  // Handle deletion of a resource
  const handleDelete = async (resourceId) => {
    try {
      const response = await fetch(`/resources/${resourceId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to delete resource");
      }
  
      setResources((prevResources) =>
        prevResources.filter((resource) => resource._id !== resourceId)
      );
  
      setSuccessMsg("Resource deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };


  // Handle form submission to add a new resource link
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

    {successMsg && <div className="success-popup">{successMsg}</div>}
    {error && <div className="error-popup">{error}</div>}

    <ul className="resources-list">
      {resources.length === 0 ? (
        <li className="resources-empty">No resources found.</li>
      ) : (
        resources.map(({ _id, links }) => (
          <li key={_id} className="resource-item">
            <div className="resource-content">
              <div className="links-container">
                <ul className="resource-links">
                  {(links || []).map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>

                {editingResourceId === _id && (
                  <div className="update-form">
                    <input
                      type="url"
                      value={updatedLink}
                      onChange={(e) => setUpdatedLink(e.target.value)}
                      className="update-input"
                      placeholder="Enter new link"
                      required
                    />
                    <button
                      onClick={() => submitUpdate(_id)}
                      className="update-submit-button"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setEditingResourceId(null)}
                      className="update-cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {editingResourceId !== _id && (
                <div className="button-group">
                  <button
                    onClick={() => {
                      setEditingResourceId(_id);
                      setUpdatedLink(links[0] || "");
                    }}
                    className="update-button"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(_id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))
      )}
    </ul>

    {/* Add Link form placed here at the bottom */}
    <div className="add-link-wrapper">
    <form onSubmit={handleSubmit} className="resources-form" style={{ marginTop: "20px" }}>
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
    </div>
    
  </div>
);

};

export default Resources;
