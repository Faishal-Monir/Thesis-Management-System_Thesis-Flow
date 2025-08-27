import React, { useState } from "react";
import "./request_domain_enlistment.css";
import { createApprovalRequest } from "../api";

function RequestDomainEnlistment() {
	const session = JSON.parse(localStorage.getItem("session") || "{}");
	const isFaculty = session.usr_type === "Faculty" && session.status === 1;
	const sup_id = session.student_id;
		const [loading, setLoading] = useState(false);
		const [message, setMessage] = useState("");
		const [error, setError] = useState("");
		const [msg, setMsg] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");
		if (!isFaculty) {
			setError("Access denied. Only Faculty with status 1 can request domain enlistment.");
			return;
		}
			setLoading(true);
			try {
				await createApprovalRequest({ sup_id, type: "domain_enlistment", status: 0, msg });
				setMessage("Domain enlistment request submitted successfully.");
			} catch (err) {
				setError(err.response?.data?.error || "Failed to submit request.");
			}
			setLoading(false);
	};

	return (
		<div className="request-domain-enlistment-page">
			<div className="request-domain-enlistment-container">
				<h2 className="request-domain-enlistment-title">Request Domain Enlistment</h2>
				<form className="request-domain-enlistment-form" onSubmit={handleSubmit}>
								<div>
									<span className="request-domain-enlistment-label">Supervisor ID:</span>
									<div className="request-domain-enlistment-input" style={{ background: '#e5e7eb' }}>{sup_id}</div>
								</div>
								<div>
									<span className="request-domain-enlistment-label">Type:</span>
									<div className="request-domain-enlistment-input" style={{ background: '#e5e7eb' }}>domain_enlistment</div>
								</div>
								<div>
									<span className="request-domain-enlistment-label">Status:</span>
									<div className="request-domain-enlistment-input" style={{ background: '#e5e7eb' }}>0</div>
								</div>
								<div>
									<span className="request-domain-enlistment-label">Domain Data:</span>
									<input
										className="request-domain-enlistment-input"
										type="text"
										value={msg}
										onChange={e => setMsg(e.target.value)}
										placeholder="Enter new domain data"
										required
										disabled={loading}
									/>
								</div>
					{error && <div className="request-domain-enlistment-error">{error}</div>}
					{message && <div className="request-domain-enlistment-success">{message}</div>}
					<button
						type="submit"
						className="request-domain-enlistment-btn"
						disabled={loading}
					>
						{loading ? "Processing..." : "Request Domain Enlistment"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default RequestDomainEnlistment;
