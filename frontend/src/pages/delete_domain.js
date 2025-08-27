
import React, { useState } from "react";
import "./delete_domain.css";
import { fetchDomainBySupId, clearDomain } from "../api";

function DeleteDomain() {
	const session = JSON.parse(localStorage.getItem("session") || "{}");
	const isFaculty = session.usr_type === "Faculty" && session.status === 1;
	const sup_id = session.student_id;
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleDelete = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		if (!isFaculty) {
			setError("Access denied. Only Faculty with status 1 can delete domain.");
			return;
		}
		setLoading(true);
		try {
			await clearDomain(sup_id);
			setMessage("Domain and Field cleared successfully.");
		} catch (err) {
			setError(err.message);
		}
		setLoading(false);
	};

	return (
		<div className="delete-domain-page">
			<div className="delete-domain-container">
				<h2 className="delete-domain-title">Delete Domain and Field</h2>
				<form className="delete-domain-form" onSubmit={handleDelete}>
					<div>
						<span className="delete-domain-label">Supervisor ID:</span>
						<div className="delete-domain-input" style={{ background: '#e5e7eb' }}>{sup_id}</div>
					</div>
					{error && <div className="delete-domain-error">{error}</div>}
					{message && <div className="delete-domain-success">{message}</div>}
					<button
						type="submit"
						className="delete-domain-btn"
						disabled={loading}
					>
						{loading ? "Processing..." : "Delete Domain"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default DeleteDomain;

