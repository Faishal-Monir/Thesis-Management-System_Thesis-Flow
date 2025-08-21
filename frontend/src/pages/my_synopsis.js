import React, { useEffect, useState } from "react";
import "./my_synopsis.css";
import { getSynopsisBySupId } from "../api";

function MySynopsis() {
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const sup_id = session.student_id;
  const isFaculty = session.usr_type === "Faculty";

  const [synopsisList, setSynopsisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFaculty) {
      setError("Access denied. Only Faculty can view this page.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = () => {
      getSynopsisBySupId(sup_id)
        .then((res) => {
          if (!isMounted) return;
          setSynopsisList(res.data || []);
          setLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setError("Failed to fetch synopsis.");
          setLoading(false);
        });
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [sup_id, isFaculty]);

  if (loading) {
    return (
      <div className="my-synopsis-page">
        <h2 className="my-synopsis-title">My Synopsis</h2>
        <div className="my-synopsis-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-synopsis-page">
        <h2 className="my-synopsis-title">My Synopsis</h2>
        <div className="my-synopsis-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-synopsis-page">
      <h2 className="my-synopsis-title">My Synopsis</h2>

      <div className="synopsis-card-list">
        {synopsisList.map((item) => {
          const isTaken = Number(item.status) === 1;
          return (
            <div className="synopsis-card" key={item._id || item.syn_id}>
              <div className="synopsis-card-header minimal">
                <div className="synopsis-card-id">
                  ID: <span>{item.syn_id}</span>
                </div>
              </div>

              <div className="synopsis-card-topic">
                <div className="topic-label">Topic</div>
                <div className="topic-text">{item.topic}</div>
              </div>

              <div className="synopsis-card-footer">
                <div className="synopsis-card-status">
                  <span
                    className={
                      isTaken ? "status-dot taken" : "status-dot available"
                    }
                  ></span>
                  <span className="status-text">
                    {isTaken ? "Taken" : "Available"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {synopsisList.length === 0 && (
          <div className="synopsis-empty">No synopsis found.</div>
        )}
      </div>
    </div>
  );
}

export default MySynopsis;
