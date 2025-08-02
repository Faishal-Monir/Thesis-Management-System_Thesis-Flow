const express = require('express');
const router = express.Router();
const { Userdata } = require('../models/schemas');

router.get('/dashboard/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Userdata.findOne({ mail: email }).select('-Password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    let details = {};
    // Check email domain for role
    if (email.endsWith('@g.bracu.ac.bd')) {
      details = {
        name: user.Name,
        email: user.mail,
        student_id: user.student_id,
        status: user.status
      };
      res.json({ user: details, role: 'Student' });
    } else if (email.endsWith('@bracu.ac.bd')) {
      details = {
        name: user.Name,
        email: user.mail,
        faculty_id: user.student_id,
        status: user.status
      };
      res.json({ user: details, role: 'Faculty' });
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


