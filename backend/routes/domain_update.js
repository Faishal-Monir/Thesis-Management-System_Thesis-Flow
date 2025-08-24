const express = require('express');
const router = express.Router();
const { Domain } = require('../models/schemas');

// Update domain API
router.put('/domain', async (req, res) => {
  try {
    const { sup_id, domain, Field } = req.body;
    if (!sup_id || !domain || !Field) {
      return res.status(400).json({ error: 'sup_id, domain, and Field are required.' });
    }

    const existing = await Domain.findOne({ sup_id });
    if (!existing) {
      return res.status(404).json({ error: 'Domain entry not found for the given sup_id.' });
    }

    existing.domain = domain;
    existing.Field = Field;
    await existing.save();

    res.status(200).json({ message: 'Domain updated successfully.', domain: existing });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

module.exports = router;
