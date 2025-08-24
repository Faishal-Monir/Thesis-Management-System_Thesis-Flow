
const express = require('express');
const router = express.Router();
const { DomainList } = require('../models/schemas');

// Register a new domain list entry with next id_no
router.post('/register', async (req, res) => {
  try {
    const { domain_subject } = req.body;
    if (!domain_subject) {
      return res.status(400).json({ error: 'domain_subject is required.' });
    }
    // Find the current max id_no
    const maxDomain = await DomainList.findOne({}, {}, { sort: { id_no: -1 } });
    const nextId = maxDomain ? maxDomain.id_no + 1 : 1;
    const newDomain = new DomainList({ id_no: nextId, domain_subject });
    await newDomain.save();
    res.status(201).json({ message: 'Domain registered.', domain: newDomain });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});


// View all domain list entries
router.get('/view', async (req, res) => {
  try {
    const domains = await DomainList.find({}, { _id: 0 });
    res.status(200).json({ domains });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

// Update a domain list entry by id_no
router.put('/update/:id_no', async (req, res) => {
  try {
    const { id_no } = req.params;
    const { domain_subject } = req.body;
    if (!domain_subject) {
      return res.status(400).json({ error: 'domain_subject is required.' });
    }
    const updated = await DomainList.findOneAndUpdate(
      { id_no: Number(id_no) },
      { domain_subject },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: `id_no ${id_no} not found.` });
    }
    res.status(200).json({ message: 'Domain updated.', domain: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

// Delete a domain list entry by id_no
router.delete('/delete/:id_no', async (req, res) => {
  try {
    const { id_no } = req.params;
    const deleted = await DomainList.findOneAndDelete({ id_no: Number(id_no) });
    if (!deleted) {
      return res.status(404).json({ error: `id_no ${id_no} not found.` });
    }
    res.status(200).json({ message: 'Domain deleted.', domain: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

module.exports = router;