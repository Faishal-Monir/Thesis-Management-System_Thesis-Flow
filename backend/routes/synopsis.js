
const express = require('express');
const router = express.Router();
const { Synopsis } = require('../models/schemas');




// POST /register/synopsis - Create a new synopsis entry
router.post('/register/synopsis', async (req, res) => {
  try {
    
    const { sup_id, name, mail } = req.body; 
    const { topic, status } = req.body;
    if (!sup_id || !name || !mail || !topic || typeof status === 'undefined') {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const synopsis = new Synopsis({ sup_id, name, mail, topic, status });
    await synopsis.save();
    res.status(201).json({ message: 'Synopsis created', synopsis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// GET /synopsis - View all synopsis entries
router.get('/synopsis', async (req, res) => {
  try {
    const allSynopsis = await Synopsis.find();
    res.json(allSynopsis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET /synopsis/:sup_id - View synopsis by supervisor id
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

module.exports = router;
