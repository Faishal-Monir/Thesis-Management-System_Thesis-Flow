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

router.get('/show/:thesisid/:stage', async (req, res) => {
	try {
		const thesisid = req.params.thesisid;
		const stage = req.params.stage;
		if (!['P1','P2','P3'].includes(stage)) {
			return res.status(400).json({ message: 'Invalid stage' });
		}
		const thesis = await Thesis.findOne({ thesis_id: thesisid });
		if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
		const feedback = thesis.feedback && thesis.feedback[stage] ? thesis.feedback[stage] : "";
		res.json({ thesisid: thesis.thesis_id, stage, feedback });
	} catch (err) {
		res.status(500).json({ message: 'Error fetching stage feedback' });
	}
});

router.put('/update/:thesisid', async (req, res) => {
	try {
		const thesisid = Number(req.params.thesisid); // Ensure number type
		const { stage, feedback } = req.body;
		if (!stage || !['P1','P2','P3'].includes(stage)) {
			return res.status(400).json({ message: 'Invalid or missing stage' });
		}
		// Find thesis
		const thesis = await Thesis.findOne({ thesis_id: thesisid });
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
	// Ensure feedback subfields exist
	if (!thesis.feedback) {
		thesis.feedback = { P1: "", P2: "", P3: "" };
	}
		if (!Object.prototype.hasOwnProperty.call(thesis.feedback, stage)) {
			return res.status(400).json({ message: 'Invalid stage key in feedback' });
		}
		thesis.feedback[stage] = feedback;
		await thesis.save();
		res.json({ thesisid: thesis.thesis_id, feedback: thesis.feedback });
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: 'Error updating feedback' });
  }
});


router.delete('/delete/:thesisid', async (req, res) => {
	try {
		const thesisid = req.params.thesisid;
		const thesis = await Thesis.findOne({ thesis_id: thesisid });
		if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
		thesis.feedback = { P1: "", P2: "", P3: "" };
		await thesis.save();
		res.json({ message: 'Feedback deleted', thesisid });
	} catch (err) {
		res.status(500).json({ message: 'Error deleting feedback' });
	}
});

module.exports = router;
