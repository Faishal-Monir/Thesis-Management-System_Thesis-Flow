const express = require('express');
const router = express.Router();
const { Userdata } = require('../models/schemas');

// GET /users/dashboard - fetch all users OR one by student_id query param
router.get('/dashboard', async (req, res) => {
  try {
    const { student_id } = req.query;

    if (student_id) {
      // fetch single user
      const user = await Userdata.findOne({ student_id }).select('-Password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      let details = {};

      if (user.usr_type === 'Student') {
        details = {
          name: user.Name,
          email: user.mail,
          student_id: user.student_id,
          status: user.status
        };
        return res.json({ user: details, role: 'Student' });
      } 
      else if (user.usr_type === 'Faculty') {
        details = {
          name: user.Name,
          email: user.mail,
          student_id: user.student_id,
          status: user.status
        };
        return res.json({ user: details, role: 'Faculty' });
      } 

      else if (user.usr_type === 'Admin') {
        details = {
          name: user.Name,
          email: user.mail,
          student_id: user.student_id,
          status: user.status
        };
        return res.json({ user: details, role: 'Admin' });
      } 

            else if (user.usr_type === 'Ra') {
        details = {
          name: user.Name,
          email: user.mail,
          student_id: user.student_id,
          status: user.status
        };
        return res.json({ user: details, role: 'Ra' });
      } 

            else if (user.usr_type === 'Ta') {
        details = {
          name: user.Name,
          email: user.mail,
          student_id: user.student_id,
          status: user.status
        };
        return res.json({ user: details, role: 'Ta' });
      } 











      
      else {
        return res.status(400).json({ error: 'Invalid user role' });
      }
    } else {
      // fetch all users
      const users = await Userdata.find({}).select('-Password');
      return res.json(users);
    }
  } catch (err) {
    console.error('🔥 Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


