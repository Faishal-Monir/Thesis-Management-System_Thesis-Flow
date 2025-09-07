const express = require('express');
const router = express.Router();
const { StudentProposal } = require('../models/schemas');


// POST httpslocalhost5000/students/propose – Student submits proposal
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

// GET /students/propose – Get all proposals (faculty view - excludes approved proposals)
router.get('/propose', async (req, res) => {
  const { faculty_id } = req.query; // Get faculty_id from query params
  
  try {
    let query = {};
    
    if (faculty_id) {
      // Faculty view: exclude proposals approved by other faculty
      query = {
        $or: [
          { status: 'Pending' },
          { status: 'Interested' },
          { status: 'Rejected' },
          { 
            status: 'Approved', 
            'updated_by.faculty_id': faculty_id 
          }
        ]
      };
    }
    
    const proposals = await StudentProposal.find(query);
    return res.status(200).json(proposals);
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ error: 'Server error while fetching proposals.' });
  }
});

// GET httpslocalhost5000/students/propose/:id – Get single proposal by ID
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

// PUT /students/propose/:id – Update a proposal
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

// DELETE /students/propose/:id – Delete a proposal
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


// POST /students/propose/status/:id – Faculty approves/rejects a proposal
router.post('/propose/status/:id', async (req, res) => {
  const { status, faculty_id, name, email } = req.body;
  const validStatuses = ['Approved', 'Interested', 'Rejected'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "Approved" or "Interested" or "Rejected".' });
  }
  if (!faculty_id || !name || !email) {
    return res.status(400).json({ error: 'faculty_id, name, and email are required.' });
  }

  try {
    const proposal = await StudentProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found.' });

    // Check if proposal is already approved by another faculty
    if (proposal.status === 'Approved' && proposal.updated_by?.faculty_id !== faculty_id) {
      return res.status(400).json({ error: 'Proposal is already approved by another faculty.' });
    }

    proposal.status = status;
    proposal.updated_by = {
      faculty_id,
      name,
      email
    };
    await proposal.save();

    return res.status(200).json({ 
      message: `Proposal ${status.toLowerCase()} successfully.`,
      proposal 
    });
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return res.status(500).json({ error: 'Server error while updating proposal status.' });
  }
});

// GET /students/propose – Get all proposals (faculty view - excludes approved proposals by other faculty)
router.get('/propose', async (req, res) => {
  const { faculty_id } = req.query; // Get faculty_id from query params
  
  try {
    let query = {};
    
    if (faculty_id) {
      // Faculty view: exclude proposals approved by other faculty
      query = {
        $or: [
          { status: 'Pending' },
          { status: 'Interested' },
          { status: 'Rejected' },
          { 
            status: 'Approved', 
            'updated_by.faculty_id': faculty_id 
          }
        ]
      };
    }
    
    const proposals = await StudentProposal.find(query);
    return res.status(200).json(proposals);
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ error: 'Server error while fetching proposals.' });
  }
});

module.exports = router;