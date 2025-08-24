const express = require('express');
const router = express.Router();
const { Domain } = require('../models/schemas');

// domain register api naming error it should be domain_register.(Faishal)
router.post('/domain', async (req, res) => {
  try {
    const { sup_id, domain, Field } = req.body;
    if (!sup_id || !domain || !Field) {
      return res.status(400).json({ error: 'sup_id, domain, and Field are required.' });
    }

    const existing = await Domain.findOne({ sup_id });
    if (existing) {
      return res.status(409).json({ error: `sup_id ${sup_id} already exists. Registration aborted.` });
    }

    const newDomain = new Domain({ sup_id, domain, Field });
    await newDomain.save();

    res.status(201).json({ message: 'Domain registered successfully.', domain: newDomain });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});


router.put('/clear', async (req, res) => {
  try {
    const { sup_id } = req.body;
    if (!sup_id) {
      return res.status(400).json({ error: 'sup_id is required.' });
    }
    
    const updated = await Domain.findOneAndUpdate(
      { sup_id },
      { domain: '', Field: '' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: `sup_id ${sup_id} not found.` });
    }
    res.status(200).json({ message: 'Domain and Field cleared.', domain: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});




// API to view domain for a specific sup_id

// API to view domain for a specific sup_id (including Field)
router.get('/view/:sup_id', async (req, res) => {
  try {
    const { sup_id } = req.params;
    const domainData = await Domain.findOne({ sup_id }, { sup_id: 1, domain: 1, Field: 1, _id: 0 });
    if (!domainData) {
      return res.status(404).json({ error: `sup_id ${sup_id} not found.` });
    }
    res.status(200).json({ domain: domainData });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});



// API to view all domains (including Field)
router.get('/view', async (req, res) => {
  try {
    const domains = await Domain.find({}, { sup_id: 1, domain: 1, Field: 1, _id: 0 });
    res.status(200).json({ domains });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});


module.exports = router;