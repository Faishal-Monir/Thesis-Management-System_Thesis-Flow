const express = require('express');
const router = express.Router();
const { Userdata } = require('../models/schemas');


// GET /usr - fetch all students
router.get('/', async (req, res) => {
  try {
    const users = await Userdata.find({ usr_type: 'Student' });
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

// GET /usr/:student_id - fetch user by student_id
router.get('/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const user = await Userdata.findOne({ student_id });
    if (!user) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});




// Decrypt function (same as used for encryption, but for decryption)
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.SECRET_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars
const IV_LENGTH = 16;

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = textParts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}









// GET /usr/gopon/:student_id - decrypt and show password
router.get('/password/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    const user = await Userdata.findOne({ student_id });
    if (!user) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    let decryptedPassword;
    try {
      decryptedPassword = decrypt(user.Password);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to decrypt password.' });
    }
    return res.status(200).json({ student_id, decryptedPassword });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

















module.exports = router;
