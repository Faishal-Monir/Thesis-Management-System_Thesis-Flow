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


// Password reset API
router.post('/', async (req, res) => {
  try {
    const { student_id, new_password } = req.body;
    if (!student_id || !new_password) {
      return res.status(400).json({ error: 'student_id and new password are required.' });
    }

    const encryptedPassword = encrypt(new_password);

    const user = await Userdata.findOneAndUpdate(
      { student_id },
      { Password: encryptedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

module.exports = router;
