const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { Userdata } = require('../models/schemas');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});







router.post('/send', async (req, res) => {
  const { mail, msg, subject } = req.body;
  if (!mail || !msg || !subject) {
    return res.status(400).json({ error: 'mail, msg and subject are required' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: mail,
    subject: subject,
    text: msg
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: `Email sent to ${mail}` });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});



// POST /sendAll - send email to all users in the database
router.post('/toall', async (req, res) => {
  const { msg, subject } = req.body;
  if (!msg || !subject) {
    return res.status(400).json({ error: 'msg and subject are required' });
  }

  try {
    const users = await Userdata.find({}, 'mail');
    const emails = users.map(user => user.mail);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emails,
      subject: subject,
      text: msg
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: `Email sent to all users (${emails.length})` });
  } catch (error) {
    console.error('Error sending emails to all users:', error);
    res.status(500).json({ error: 'Failed to send emails to all users' });
  }
});

module.exports = router;
