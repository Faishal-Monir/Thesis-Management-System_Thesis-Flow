import { useEffect, useState } from "react";
import "./resources.css";
import { fetchResourcesAPI, addResourceAPI, updateResourceAPI, deleteResourceAPI } from "../api"; // Import API functions

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedLink, setUpdatedLink] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const session = JSON.parse(localStorage.getItem("session")); // Get session from localStorage
  const isFaculty = session?.usr_type === "Faculty"; // Check if the user is a Faculty

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    let timeout;
    if (successMsg || error) {
      timeout = setTimeout(() => {
        setSuccessMsg("");
        setError("");
      }, 3000);
    }
    return () => clearTimeout(timeout); 
  }, [successMsg, error]);

  // Fetch all resources from server
  const fetchResources = async () => {
    try {
      const data = await fetchResourcesAPI(); 
      setResources(data);
      setError(null); // Clear any previous error
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Validate URL regex
  const urlRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;


  // Handle form submission to add a new resource
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!newLink.trim()) {
      setError("Please enter a link");
      return;
    }
    if (!urlRegex.test(newLink.trim())) {
      setError("Please enter a valid URL");
      return;
    }
    if (!window.confirm("Are you sure you want to add a resource?")) {
      return; // User canceled
    }

    // Check for duplicate link or title (case-insensitive)
    const duplicate = resources.some(
      (res) =>
        res.link.toLowerCase() === newLink.trim().toLowerCase() ||
        res.title.toLowerCase() === newTitle.trim().toLowerCase()
    );
    if (duplicate) {
      setError("Resource with this title or link already exists");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newResource = await addResourceAPI({
        title: newTitle.trim(),
        link: newLink.trim(),
      }); 
      setResources((prev) => [...prev, newResource]);
      setNewTitle("");
      setNewLink("");
      setSuccessMsg("Resource added successfully");
      console.log("Success message set:", "Resource added successfully");
      setShowAddForm(false);
      setTimeout(() => setSuccessMsg(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
      console.log("Error message set:", err.message);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    } finally {
      setLoading(false);
    }
  };

  // Submit update for title and link
  const submitUpdate = async (resourceId) => {
    if (!updatedTitle.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!updatedLink.trim()) {
      setError("Please enter a link");
      return;
    }
    if (!urlRegex.test(updatedLink.trim())) {
      setError("Please enter a valid URL");
      return;
    }
    if (!window.confirm("Are you sure you want to update this resource?")) {
      return; // User canceled
    }

    try {
      const updatedResource = await updateResourceAPI(resourceId, {
        title: updatedTitle.trim(),
        link: updatedLink.trim(),
      }); // Use API function
      setResources((prev) =>
        prev.map((res) => (res._id === resourceId ? updatedResource : res))
      );

      setSuccessMsg("Resource updated successfully");
      setEditingResourceId(null);
      setTimeout(() => setSuccessMsg(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Handle deletion
  const handleDelete = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete the resource?")) {
      return; 
    }
    try {
      await deleteResourceAPI(resourceId); 
      setResources((prev) => prev.filter((res) => res._id !== resourceId));
      setSuccessMsg("Resource deleted successfully");
      setTimeout(() => setSuccessMsg(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  return (
    <div className="resources-container">
      <h1 className="resources-title">Thesis Resources</h1>

      {/* Ensure success and error messages are rendered */}
      {successMsg && <div className="success-popup">{successMsg}</div>}
      {error && <div className="error-popup">{error}</div>}

      <ul className="resources-list">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : resources.length === 0 ? (
          <li className="resources-empty">No resources found.</li>
        ) : (
          resources.map(({ _id, title, link }) => (
            <li key={_id} className="resource-item">
              <div className="resource-content">
                <div className="resource-details">
                  <strong className="resource-title">{title}</strong>
                  <br />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                  >
                    {link}
                  </a>
                </div>

                {isFaculty && editingResourceId === _id ? (
                  <div className="update-form">
                    <input
                      type="text"
                      value={updatedTitle}
                      onChange={(e) => setUpdatedTitle(e.target.value)}
                      className="update-input"
                      placeholder="Enter new title"
                      required
                    />
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
                ) : isFaculty ? (
                  <div className="button-group">
                    <button
                      onClick={() => {
                        setEditingResourceId(_id);
                        setUpdatedTitle(title);
                        setUpdatedLink(link);
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
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Add Link form */}
      {isFaculty && (
        <div className="add-link-wrapper" style={{ marginTop: "20px" }}>
          {!showAddForm ? (
            <button
              className="resources-button"
              onClick={() => setShowAddForm(true)}
            >
              Add New Resource
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="resources-form">
              <input
                type="text"
                placeholder="Enter resource title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="resources-input"
                required
              />
              <input
                type="url"
                placeholder="Enter resource link"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="resources-input"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="resources-button"
              >
                {loading ? "Adding..." : "Add Resource"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="resources-button"
                style={{ marginTop: "10px", backgroundColor: "#ccc", color: "#333" }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;
