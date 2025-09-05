const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/schemas').Userdata; 

// PUT /update-user/:student_id
router.put('/update-user/:student_id', async (req, res) => {
	const { student_id } = req.params;
	const { Name, mail, profile_pic } = req.body;

	// Build update object only with provided fields
	const updateFields = {};
	if (Name !== undefined) updateFields.Name = Name;
	if (mail !== undefined) updateFields.mail = mail;
	if (profile_pic !== undefined) updateFields.profile_pic = profile_pic;

	try {
		const updatedUser = await User.findOneAndUpdate(
			{ student_id },
			updateFields,
			{ new: true }
		);
		if (!updatedUser) return res.status(404).json({ error: 'User not found' });
		res.json(updatedUser);
	} catch (err) {
		res.status(500).json({ error: 'Update failed', details: err.message });
	}
});

module.exports = router;
