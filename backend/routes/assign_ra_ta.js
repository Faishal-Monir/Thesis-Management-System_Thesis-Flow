const express = require('express');
const router = express.Router();
const { Thesis } = require('../models/schemas');

// PUT /assighelp/:groupid
router.put('/:groupid', async (req, res) => {
  try {
    const groupid = Number(req.params.groupid);
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Missing id in request body' });
    }
    const thesis = await Thesis.findOne({ group_id: groupid });
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });
    // Ensure RaTa field exists
    if (!('RaTa' in thesis)) {
      thesis.RaTa = id;
    } else {
      thesis.RaTa = id;
    }
    await thesis.save();
    res.json({ message: 'RaTa assigned', group_id: groupid, RaTa: thesis.RaTa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error assigning RaTa' });
  }
});

module.exports = router;
