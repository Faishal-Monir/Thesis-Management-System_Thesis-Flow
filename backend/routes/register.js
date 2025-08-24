
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Userdata } = require('../models/schemas');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.SECRET_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Register API
router.post('/', async (req, res) => {
  try {
    const { Name, student_id, mail, Password } = req.body;
    if (!Name || !student_id || !mail || !Password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingStudent = await Userdata.findOne({ student_id });
    if (existingStudent) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    let usr_type = 'Faculty';
    let status = 0;
    if (mail.includes('@g.bracu')) {
      usr_type = 'Student';
      status = 1;
    }
    const encryptedPassword = encrypt(Password);
    const user = new Userdata({
      Name,
      student_id,
      mail,
      Password: encryptedPassword,
      usr_type,
      status
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Email already exists.' });
    } else {
      res.status(500).json({ error: err.message || 'Server error.' });
    }
  }
});

module.exports = router;
