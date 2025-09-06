import React, { useEffect, useState } from 'react';
import { fetchAllMeetings, bookMeeting, checkUserExists, fetchAllUsers } from '../api';
import './view_book_meeting.css';

// Get session from localStorage (or context)
const getSession = () => {
	try {
		const s = localStorage.getItem('session');
		return s ? JSON.parse(s) : {};
	} catch {
		return {};
	}
};



const ViewBookMeeting = () => {
	const [meetings, setMeetings] = useState([]);
	const [facultyNames, setFacultyNames] = useState({});
	const [searchFaculty, setSearchFaculty] = useState('');
		// Removed sortAsc
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showPopup, setShowPopup] = useState(false);
	const [popupData, setPopupData] = useState({ faculty_id: '', type: '', });
	const [date, setDate] = useState('');
	const [time, setTime] = useState('');
	const [facultyList, setFacultyList] = useState([]);

	const session = getSession();

	useEffect(() => {
		if (session.usr_type === 'Student') {
			setLoading(true);
			import('../api').then(({ deleteExpiredMeetings }) => deleteExpiredMeetings())
				.finally(() => {
					Promise.all([
						fetchAllMeetings(),
						fetchAllUsers()
					])
						.then(async ([meetingsRes, usersRes]) => {
							const data = meetingsRes.data || [];
							setMeetings(data);
							// Fetch faculty names for each unique faculty_id
							const ids = [...new Set(data.map(m => m.faculty_id))];
							const names = {};
							await Promise.all(ids.map(async id => {
								try {
									const res = await checkUserExists(id);
									names[id] = res.data.Name || id;
								} catch {
									names[id] = id;
								}
							}));
							setFacultyNames(names);
							// Filter only faculty users
							const faculties = (usersRes.data || []).filter(u => u.usr_type === 'Faculty');
							setFacultyList(faculties);
							setLoading(false);
						})
						.catch(err => {
							setError('Failed to fetch meetings or faculties');
							setLoading(false);
						});
				});
		}
	}, [session.usr_type]);

		// Filter meetings by faculty name
		const sortedMeetings = [...meetings]
			.filter(m => {
				const name = facultyNames[m.faculty_id] || m.faculty_id;
				return name.toLowerCase().includes(searchFaculty.toLowerCase());
			});

	// Find first available pending meeting for Book button
	const firstPending = (() => {
		for (const meeting of sortedMeetings) {
			for (const ev of meeting.event) {
				if (ev.status === 0) {
					return { meeting, ev };
				}
			}
		}
		return null;
	})();

	const openPopup = () => {
		setPopupData({ faculty_id: '', type: '' });
		setDate('');
		setTime('');
		setShowPopup(true);
	};

	const closePopup = () => {
		setShowPopup(false);
		setDate('');
		setTime('');
		setPopupData({ faculty_id: '', type: '' });
	};

	// Check if student already has any meeting (pending or booked) with selected faculty
	const hasMeetingWithFaculty = (facultyId) => {
		const meeting = meetings.find(m => m.faculty_id === facultyId);
		if (!meeting) return false;
		return meeting.event.some(ev => ev.student_id === session.student_id);
	};

	const handleBookSubmit = async (e) => {
		e.preventDefault();
		// Check for any meeting (pending or booked) for this student and faculty
		if (hasMeetingWithFaculty(popupData.faculty_id)) {
			setError('You already have a meeting with this faculty. Please delete it before booking another.');
			return;
		}
		setLoading(true);
		try {
			// Ensure date is always yyyy-mm-dd
			let formattedDate = date;
			if (date) {
				const d = new Date(date);
				if (!isNaN(d.getTime())) {
					const yyyy = d.getFullYear();
					const mm = String(d.getMonth() + 1).padStart(2, '0');
					const dd = String(d.getDate()).padStart(2, '0');
					formattedDate = `${yyyy}-${mm}-${dd}`;
				}
			}
					await bookMeeting({
						faculty_id: popupData.faculty_id,
						event: [
							{
								student_id: session.student_id,
								date: formattedDate,
								time,
								type: popupData.type,
								status: 0,
							},
						],
					});
					alert('Meeting booked successfully!');
					closePopup();
					window.location.reload();
		} catch (err) {
			setError('Booking failed');
		}
		setLoading(false);
	};

	if (session.usr_type !== 'Student') {
		return <div className="meeting-container"><h2>Access Denied</h2></div>;
	}

	return (
		<div className="meeting-outer">
			<div className="meeting-container" >
				<h2><b>View & Book Meetings</b></h2>
						<div className="meeting-controls">
							<input
								type="text"
								placeholder="Search by Faculty Name"
								value={searchFaculty}
								onChange={e => setSearchFaculty(e.target.value)}
							/>
						</div>
				{loading && <div>Loading...</div>}
				{/* Only show error in popup, not in main container */}
				<table className="meeting-table">
					<thead>
						<tr>
							<th>Faculty Name</th>
							<th>Date</th>
							<th>Time</th>
							<th>Type</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{sortedMeetings.length === 0 && (
							<tr><td colSpan="5">No meetings found.</td></tr>
						)}
						{sortedMeetings.map(meeting => (
							meeting.event.map(ev => (
								<tr key={ev._id}>
									<td>{facultyNames[meeting.faculty_id] || meeting.faculty_id}</td>
									<td>{ev.date}</td>
									<td>{ev.time}</td>
									<td>{ev.type}</td>
									<td>{ev.status === 0 ? 'Pending' : 'Booked'}</td>
								</tr>
							))
						))}
					</tbody>
				</table>
				{/* Show one Book button for the first available pending meeting */}
				<div style={{ marginTop: '18px', textAlign: 'right' }}>
					<button className="book-btn" onClick={openPopup}>
						Book
					</button>
				</div>

						{/* Popup form for booking */}
						{showPopup && (
							<div className="popup-overlay">
								<div className="popup-form">
									<h3>Book Meeting</h3>
									{/* Error message moved to floating popup */}
					{/* Floating error popup in top right corner */}
					{error && (
						<div className="floating-error-popup">
							{error}
						</div>
					)}
									<form onSubmit={handleBookSubmit}>
										<div>
											<label>Faculty:</label>
											<select value={popupData.faculty_id} onChange={e => setPopupData({ ...popupData, faculty_id: e.target.value })} required>
												<option value="">Select Faculty</option>
												{facultyList.map(fac => (
													<option key={fac._id} value={fac.student_id}>{fac.Name}</option>
												))}
											</select>
										</div>
										<div>
											<label>Type:</label>
											<input type="text" value={popupData.type} onChange={e => setPopupData({ ...popupData, type: e.target.value })} required />
										</div>
										<div>
											<label>Date:</label>
											<input type="date" value={date} onChange={e => setDate(e.target.value)} required />
										</div>
										<div>
											<label>Time:</label>
											<input type="time" value={time} onChange={e => setTime(e.target.value)} required />
										</div>
										<div style={{ marginTop: '12px' }}>
											<button className="book-btn" type="submit" disabled={loading}>Confirm Book</button>
											<button type="button" style={{ marginLeft: '8px' }} onClick={closePopup}>Cancel</button>
										</div>
									</form>
								</div>
							</div>
						)}
			</div>
		</div>
	);
};

export default ViewBookMeeting;
