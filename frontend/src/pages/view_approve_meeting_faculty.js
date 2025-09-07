
import React, { useEffect, useState } from 'react';
import { fetchMeetingsByFacultyId, checkUserExists } from '../api';
import './view_approve_meeting_faculty.css';

// Get session from localStorage (or context)
const getSession = () => {
	try {
		const s = localStorage.getItem('session');
		return s ? JSON.parse(s) : {};
	} catch {
		return {};
	}
};


const ViewApproveMeetingFaculty = () => {
	const [meetings, setMeetings] = useState([]);
	const [studentNames, setStudentNames] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showApproved, setShowApproved] = useState(false);

	const session = getSession();

	useEffect(() => {
		if (session.usr_type === 'Faculty') {
			setLoading(true);
			import('../api').then(({ deleteExpiredMeetings }) => deleteExpiredMeetings())
				.finally(() => {
					fetchMeetingsByFacultyId(session.student_id)
						.then(async res => {
							const events = res.data.event || [];
							setMeetings(events);
							// Fetch student names for each unique student_id
							const ids = [...new Set(events.map(ev => ev.student_id))];
							const names = {};
							await Promise.all(ids.map(async id => {
								try {
									const res = await checkUserExists(id);
									names[id] = res.data.Name || id;
								} catch {
									names[id] = id;
								}
							}));
							setStudentNames(names);
							setLoading(false);
						})
						.catch(() => {
							// setError('Failed to fetch meetings');
							setLoading(false);
						});
				});
		}
	}, [session.student_id, session.usr_type]);

	// Filter meetings by approval status if needed
	const filteredMeetings = showApproved
		? meetings.filter(ev => ev.status === 1)
		: meetings;

	if (session.usr_type !== 'Faculty') {
		return <div className="meeting-container"><h2>Access Denied</h2></div>;
	}

	return (
		<div className="meeting-container">
			<h1><b>Faculty Meeting Approval</b></h1>
			<div className="meeting-controls" style={{ justifyContent: 'flex-end', display: 'flex' }}>
				<button className="sort-btn" onClick={() => setShowApproved(!showApproved)}>
					{showApproved ? 'Show All Meetings' : 'Show Approved Meetings'}
				</button>
			</div>
			{loading && <div>Loading...</div>}
			{error && <div className="error">{error}</div>}
			<table className="meeting-table">
				<thead>
					<tr>
						<th>Student Name</th>
						<th>Student ID</th>
						<th>Date</th>
						<th>Time</th>
						<th>Type</th>
						<th>Status</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{filteredMeetings.length === 0 && (
						<tr><td colSpan="7">No meetings found.</td></tr>
					)}
					{filteredMeetings.map(ev => (
						<tr key={ev._id}>
							<td>{studentNames[ev.student_id] || ev.student_id}</td>
							<td>{ev.student_id}</td>
							<td>{ev.date}</td>
							<td>{ev.time}</td>
							<td>{ev.type}</td>
							<td>{ev.status === 1 ? 'Approved' : 'Pending'}</td>
							<td>
								<button
									className="approve-btn"
									disabled={ev.status === 1}
									onClick={async () => {
										if (ev.status === 1) return;
										setLoading(true);
										try {
											// Approve meeting
											const apiModule = await import('../api');
											await apiModule.updateMeetingStatus(session.student_id, ev.student_id, { status: 1 });
											// Get student email
											const userRes = await apiModule.checkUserExists(ev.student_id);
											const studentMail = userRes.data.mail || userRes.data.email;
											if (studentMail) {
												await apiModule.sendRegistrationEmail({
													mail: studentMail,
													subject: "Consultation/Meeting Approved",
													msg: "Hello this is to inform you that your requested consultation/meeting has been approved by the faculty.\nPlease check your dashboard for more details."
												});
											}
											window.location.reload();
										} catch (err) {
											setError('Failed to approve meeting');
										}
										setLoading(false);
									}}
								>
									Approve
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ViewApproveMeetingFaculty;
