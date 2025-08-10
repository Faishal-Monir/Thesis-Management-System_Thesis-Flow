const express = require('express');
const router = express.Router();
const { Synopsis } = require('../models/schemas');




// register synopsis
router.post('/register/synopsis', async (req, res) => {
  try {
    const { sup_id, name, mail, topic, status } = req.body;
    if (!sup_id || !name || !mail || !topic || typeof status === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const allSynopsis = await Synopsis.find({}, { syn_id: 1 }).sort({ syn_id: -1 });
    let maxId = 0;
    if (allSynopsis.length > 0) {
      maxId = Math.max(...allSynopsis.map(s => s.syn_id || 0));
    }
    const newSynId = maxId + 1;

    const synopsis = new Synopsis({ sup_id, syn_id: newSynId, name, mail, topic, status });
    await synopsis.save();
    res.status(201).json({ message: 'Synopsis created', synopsis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





//View all synopsis entries
router.get('/synopsis', async (req, res) => {
  try {
    const allSynopsis = await Synopsis.find();
    res.json(allSynopsis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//View synopsis by supervisor id
router.get('/synopsis/:sup_id', async (req, res) => {
  try {
    const { sup_id } = req.params;
    const synopsisEntries = await Synopsis.find({ sup_id });
    if (synopsisEntries.length === 0) {
      return res.status(404).json({ error: 'No synopsis found for this supervisor id' });
    }
    res.json(synopsisEntries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// DELETE Delete a synopsis by sup_id and syn_id
router.delete('/delete/synopsis', async (req, res) => {
  try {
    const { sup_id, syn_id } = req.body;
    if (!sup_id || typeof syn_id === 'undefined') {
      return res.status(400).json({ error: 'sup_id and syn_id required' });
    }
    const result = await Synopsis.findOneAndDelete({ sup_id, syn_id });
    if (!result) {
      return res.status(404).json({ error: 'Synopsis not found' });
    }
    res.json({ message: 'Synopsis deleted', synopsis: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//Update a synopsis by syn_id
router.put('/update/synopsis', async (req, res) => {
  try {
    const { syn_id, name, mail, topic, status } = req.body;
    if (typeof syn_id === 'undefined') {
      return res.status(400).json({ error: 'syn_id required' });
    }
    // Build update object
    const update = {};
    if (name) update.name = name;
    if (mail) update.mail = mail;
    if (topic) update.topic = topic;
    if (typeof status !== 'undefined') update.status = status;

    const result = await Synopsis.findOneAndUpdate(
      { syn_id },
      { $set: update },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ error: 'Synopsis not found' });
    }
    res.json({ message: 'Synopsis updated', synopsis: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
