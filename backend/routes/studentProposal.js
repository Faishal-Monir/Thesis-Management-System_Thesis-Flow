const express = require('express');
const router = express.Router();
const { StudentProposal } = require('../models/schemas');

// POST /students/propose — Student submits proposal
router.post('/propose', async (req, res) => {
  const { student_id, domain, idea } = req.body;

  if (!student_id || !domain || !idea) {
    return res.status(400).json({ error: 'student_id, domain, and idea are required.' });
  }

  try {
    const newProposal = new StudentProposal({ student_id, domain, idea });
    await newProposal.save();
    return res.status(201).json({ message: 'Proposal submitted successfully.', proposal: newProposal });
  } catch (err) {
    console.error(' Error saving proposal:', err);
    return res.status(500).json({ error: 'Server error while submitting proposal.' });
  }
});

// GET /students/propose — Get all proposals
router.get('/propose', async (req, res) => {
  try {
    const proposals = await StudentProposal.find();
    return res.status(200).json(proposals);
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ error: 'Server error while fetching proposals.' });
  }
});

// GET /students/propose/:id — Get single proposal by ID
router.get('/propose/:id', async (req, res) => {
  try {
    const proposal = await StudentProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });
    return res.status(200).json(proposal);
  } catch (err) {
    console.error(' Error fetching proposal:', err);
    return res.status(500).json({ error: 'Server error while fetching proposal.' });
  }
});

// PUT /students/propose/:id — Update a proposal
router.put('/propose/:id', async (req, res) => {
  const { domain, idea } = req.body;
  try {
    const updated = await StudentProposal.findByIdAndUpdate(
      req.params.id,
      { domain, idea },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Proposal not found.' });
    return res.status(200).json({ message: 'Proposal updated successfully.', proposal: updated });
  } catch (err) {
    console.error('Error updating proposal:', err);
    return res.status(500).json({ error: 'Server error while updating proposal.' });
  }
});

// DELETE /students/propose/:id — Delete a proposal
router.delete('/propose/:id', async (req, res) => {
  try {
    const deleted = await StudentProposal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Proposal not found.' });
    return res.status(200).json({ message: 'Proposal deleted successfully.' });
  } catch (err) {
    console.error('Error deleting proposal:', err);
    return res.status(500).json({ error: 'Server error while deleting proposal.' });
  }
});

module.exports = router;

