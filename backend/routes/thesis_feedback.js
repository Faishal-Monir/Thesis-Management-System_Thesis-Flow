const express = require('express');
const router = express.Router();
const { Thesis } = require('../models/schemas');


router.get('/show/:thesisid', async (req, res) => {
	try {
		const thesisid = req.params.thesisid;
		const thesis = await Thesis.findOne({ thesis_id: thesisid });
		if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
		res.json({ thesisid: thesis.thesis_id, feedback: thesis.feedback || '' });
	} catch (err) {
		res.status(500).json({ message: 'Error fetching feedback' });
	}
});


router.put('/update/:thesisid', async (req, res) => {
	try {
		const thesisid = req.params.thesisid;
		const { feedback } = req.body;
		const updated = await Thesis.findOneAndUpdate(
			{ thesis_id: thesisid },
			{ feedback },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ message: 'Thesis not found' });
		res.json({ thesisid: updated.thesis_id, feedback: updated.feedback });
	} catch (err) {
		res.status(500).json({ message: 'Error updating feedback' });
	}
});


router.delete('/delete/:thesisid', async (req, res) => {
	try {
		const thesisid = req.params.thesisid;
		const updated = await Thesis.findOneAndUpdate(
			{ thesis_id: thesisid },
			{ feedback: '' },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ message: 'Thesis not found' });
		res.json({ message: 'Feedback deleted', thesisid });
	} catch (err) {
		res.status(500).json({ message: 'Error deleting feedback' });
	}
});

module.exports = router;
