import React, { useState, useEffect } from "react";
import "./update_domain.css";
import { fetchDomainBySupId, registerDomain, updateDomain, fetchDomainList } from "../api";


function UpdateDomain() {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const isFaculty = session.usr_type === "Faculty" && session.status === 1;

  const faculty_id = session.student_id;
  const sup_id = faculty_id;
  const [domain, setDomain] = useState("");
  const [domainOptions, setDomainOptions] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [Field, setField] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDomainList() {
      try {
        const res = await fetchDomainList();
        setDomainOptions(res.data.domains || []);
      } catch (err) {
        setDomainOptions([]);
      }
    }
    getDomainList();
  }, []);

  useEffect(() => {
    if (domain.trim() === "") {
      setFilteredDomains([]);
      setShowSuggestions(false);
    } else {
      const filtered = domainOptions.filter(opt =>
        opt.domain_subject.toLowerCase().includes(domain.toLowerCase())
      );
      setFilteredDomains(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  }, [domain, domainOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!isFaculty) {
      setError("Access denied. Only Faculty with status 1 can update domain.");
      return;
    }
    setLoading(true);
    try {
      let domainExists = false;
      try {
        const res = await fetchDomainBySupId(sup_id);
        if (res.data && res.data.domain) {
          domainExists = true;
        }
      } catch (err) {
        
        if (err.response && err.response.status === 404) {
          domainExists = false;
        } else {
          throw err;
        }
      }

      if (!domainExists) {
        await registerDomain({ sup_id, domain, Field });
        setMessage("Domain registered successfully.");
      } else {
        await updateDomain({ sup_id, domain, Field });
        setMessage("Domain updated successfully.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update/register domain.");
    }
    setLoading(false);
  };

  return (
    <div className="update-domain-page">
      <div className="update-domain-container">
        <h2 className="update-domain-title">Update Domain and Field</h2>
        <form className="update-domain-form" onSubmit={handleSubmit}>
          <div>
            <span className="update-domain-label">Supervisor ID:</span>
            <div className="update-domain-input" style={{ background: '#e5e7eb' }}>{sup_id}</div>
          </div>
          <div className="update-domain-search-wrapper">
            <span className="update-domain-label">Domain:</span>
            <input
              className="update-domain-input"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              disabled={loading}
              placeholder="Search or type domain"
              autoComplete="off"
              onFocus={() => setShowSuggestions(filteredDomains.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {showSuggestions && (
              <ul className="update-domain-suggestions">
                {filteredDomains.map(opt => (
                  <li
                    key={opt.id_no}
                    className="update-domain-suggestion-item"
                    onMouseDown={() => {
                      setDomain(opt.domain_subject);
                      setShowSuggestions(false);
                    }}
                  >
                    {opt.domain_subject}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <span className="update-domain-label">Field and Expertise:</span>
            <input
              className="update-domain-input"
              type="text"
              value={Field}
              onChange={(e) => setField(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter field"
            />
          </div>
          {error && <div className="update-domain-error">{error}</div>}
          {message && <div className="update-domain-success">{message}</div>}
          <button
            type="submit"
            className="update-domain-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : "Update Domain"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateDomain;
