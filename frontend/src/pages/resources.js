import { useEffect, useState } from "react";
import "./resources.css";

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

  useEffect(() => {
    fetchResources();
  }, []);

  // Fetch all resources from server
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
      return;  // User canceled
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
      const response = await fetch("/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          link: newLink.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to add resource");
      }

      const newResource = await response.json();
      setResources((prev) => [...prev, newResource]);
      setNewTitle("");
      setNewLink("");
      setSuccessMsg("Resource added successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
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
      return;  // User canceled
    }

    try {
      const response = await fetch(`/resources/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTitle.trim(),
          link: updatedLink.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update resource");
      }

      const updatedResource = await response.json();
      setResources((prev) =>
        prev.map((res) => (res._id === resourceId ? updatedResource : res))
      );

      setSuccessMsg("Resource updated successfully");
      setEditingResourceId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deletion
  const handleDelete = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete the resource?")) {
      return;  // User canceled
    }
    try {
      const response = await fetch(`/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to delete resource");
      }

      setResources((prev) => prev.filter((res) => res._id !== resourceId));
      setSuccessMsg("Resource deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
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

                {editingResourceId === _id ? (
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
                ) : (
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
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Add Link form */}
      <div className="add-link-wrapper">
        <form
          onSubmit={handleSubmit}
          className="resources-form"
          style={{ marginTop: "20px" }}
        >
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
          <button type="submit" disabled={loading} className="resources-button">
            {loading ? "Adding..." : "Add Resource"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Resources;
