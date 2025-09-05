const express = require('express');
const multer = require('multer');
const cloudinary = require('./cloudinary');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-profile-picture', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pics'
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    // console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
