const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Approval } = require('../models/schemas');


router.post('/req', async (req, res) => {
  try {
    const { sup_id, type, status, msg } = req.body;
    const approval = new Approval({ sup_id, type, status, msg });
    await approval.save();
    res.status(201).json({ message: 'Approval entry created', approval });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;