const express = require('express');
const router = express.Router();
const { FacultyApproval } = require('../models/schemas');

// GET all faculty meetings
router.get('/meeting', async (req, res) => {
	try {
		const meetings = await FacultyApproval.find({});
		res.json(meetings);
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
});



router.get('/meeting/:faculty_id', async (req, res) => {
	try {
		const faculty_id = req.params.faculty_id;
		const meeting = await FacultyApproval.findOne({ faculty_id });
		if (!meeting) {
			return res.status(404).json({ error: 'Faculty meeting not found' });
		}
		res.json(meeting);
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
});


// POST: Book a new faculty meeting
// POST: Book a new faculty meeting (append events if faculty_id exists)
router.post('/book/meeting', async (req, res) => {
	try {
		const { faculty_id, event } = req.body;
		if (!faculty_id || !Array.isArray(event)) {
			return res.status(400).json({ error: 'faculty_id and event array are required' });
		}
		// Validate each event item
		for (const ev of event) {
			if (!ev.student_id || !ev.date || !ev.time || !ev.type || typeof ev.status !== 'number') {
				return res.status(400).json({ error: 'Each event must have student_id, date, time, type, and status (0 or 1)' });
			}
		}
		let meeting = await FacultyApproval.findOne({ faculty_id });
		if (meeting) {
			// Append new events to existing event list
			meeting.event.push(...event);
			await meeting.save();
			return res.status(200).json(meeting);
		} else {
			// Create new document
			const newMeeting = new FacultyApproval({ faculty_id, event });
			await newMeeting.save();
			return res.status(201).json(newMeeting);
		}
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
});


// PUT: Update a specific event for a faculty_id by student_id
// PUT: Update a specific event for a faculty_id by student_id (partial update)
router.put('/update/meeting/:faculty_id/:student_id', async (req, res) => {
	try {
		const faculty_id = req.params.faculty_id;
		const student_id = req.params.student_id;
		const { date, time, type, status } = req.body;
		const meeting = await FacultyApproval.findOne({ faculty_id });
		if (!meeting) {
			return res.status(404).json({ error: 'Faculty meeting not found' });
		}
		const idx = meeting.event.findIndex(e => e.student_id === student_id);
		if (idx === -1) {
			return res.status(404).json({ error: 'Event for student_id not found' });
		}
		// Only update fields that are provided
		if (date !== undefined) meeting.event[idx].date = date;
		if (time !== undefined) meeting.event[idx].time = time;
		if (type !== undefined) meeting.event[idx].type = type;
		if (status !== undefined && typeof status === 'number') meeting.event[idx].status = status;
		await meeting.save();
		res.json(meeting.event[idx]);
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
});



// DELETE: Remove all expired meetings (events with date before today)
router.delete('/meeting/expired', async (req, res) => {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Only compare date part
		const allMeetings = await FacultyApproval.find({});
		let totalDeleted = 0;
		for (const meeting of allMeetings) {
			const originalLength = meeting.event.length;
			// Keep only events with valid date today or in future
			meeting.event = meeting.event.filter(ev => {
				if (!ev.date) return true; // If no date, keep
				// Accept only yyyy-mm-dd format
				const match = /^\d{4}-\d{2}-\d{2}$/.test(ev.date);
				if (!match) return true; // If not valid format, keep
				const evDate = new Date(ev.date);
				if (isNaN(evDate.getTime())) return true; // If invalid date, keep
				evDate.setHours(0, 0, 0, 0);
				return evDate >= today;
			});
			const deletedCount = originalLength - meeting.event.length;
			totalDeleted += deletedCount;
			if (deletedCount > 0) {
				await meeting.save();
			}
		}
		res.json({ message: 'Expired meetings deleted', totalDeleted });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
});







module.exports = router;
