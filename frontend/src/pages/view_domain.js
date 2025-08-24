import React, { useEffect, useState } from "react";
import "./view_domain.css";
import { fetchDomainBySupId } from "../api";


function ViewDomain() {
	const session = JSON.parse(localStorage.getItem("session") || "{}");
	const isFaculty = session.usr_type === "Faculty" && session.status === 1;
	const sup_id = session.student_id;
	const [domainInfo, setDomainInfo] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDomain() {
			setLoading(true);
			setError("");
			try {
				const res = await fetchDomainBySupId(sup_id);
				setDomainInfo(res.data.domain);
			} catch (err) {
				setError("Your domain info is not set.");
			}
			setLoading(false);
		}
		if (isFaculty && sup_id) {
			fetchDomain();
		} else if (!isFaculty) {
			setError("Access denied. Only Faculty with status 1 can view domain info.");
			setLoading(false);
		} else {
			setError("No ID found in session cache.");
			setLoading(false);
		}
	}, [isFaculty, sup_id]);

	return (
		<div className="view-domain-page">
			<div className="view-domain-container">
				<h2 className="view-domain-title">Domain and Research Interest</h2>
				{loading ? (
					<div className="view-domain-label">Loading...</div>
				) : error ? (
					<div className="view-domain-error">{error}</div>
				) : domainInfo ? (
					<div className="view-domain-info">
						<div>
							<span className="view-domain-label">Supervisor ID:</span>
							<div className="view-domain-value">{domainInfo.sup_id}</div>
						</div>
						<div>
							<span className="view-domain-label">Domain:</span>
							<div className="view-domain-value">{domainInfo.domain}</div>
						</div>
						<div>
							<span className="view-domain-label">Field:</span>
							<div className="view-domain-value">{domainInfo.Field}</div>
						</div>
					</div>
				) : (
					<div className="view-domain-error">No domain info found.</div>
				)}
			</div>
		</div>
	);
}

export default ViewDomain;
