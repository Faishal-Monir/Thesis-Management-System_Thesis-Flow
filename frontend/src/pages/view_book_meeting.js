import React, { useEffect, useState } from 'react';
import './view_book_meeting.css';

// Get user data from sessionStorage
const cache = (() => {
  try {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : {};
  } catch {
    return {};
  }
})();

const ViewBookMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  // Removed facultyNames state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cache.usr_type === 'Student') {
      fetch('http://localhost:5005/meeting')
        .then(res => res.json())
        .then(data => {
          setMeetings(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  if (cache.usr_type !== 'Student') {
    return <div>You are not a student. Meeting view is only for students.</div>;
  }

  // Show all meetings and all events
  return (
    <div className="meeting-list">
      <h2>Available Meetings</h2>
      {meetings.length === 0 ? (
        <div>No meetings found.</div>
      ) : (
        meetings.map(meeting => (
          <div key={meeting._id} className="meeting-card">
            <ul>
              {meeting.event.map(ev => (
                <li key={ev._id}>
                  <strong>Date:</strong> {ev.date} | <strong>Time:</strong> {ev.time} | <strong>Type:</strong> {ev.type} | <strong>Status:</strong> {ev.status === 1 ? 'Booked' : 'Available'}
                </li>
              ))}
            </ul>
            <button className="book-btn">Book Meeting</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewBookMeeting;
