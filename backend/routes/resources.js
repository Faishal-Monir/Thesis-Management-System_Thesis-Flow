const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/schemas').Resources;

// Serve static files
router.use('/files/resources', express.static(path.join(__dirname, '../files/resources')));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../files/resources');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ _id: -1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST upload resource
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !req.file) return res.status(400).json({ message: 'Title and file required' });

    const filePath = `/files/resources/${req.file.filename}`;
    const newResource = new Resource({ title, filePath });
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE resource
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Resource not found' });

    // Remove file from server
    const file = path.join(__dirname, '../', deleted.filePath);
    if (fs.existsSync(file)) fs.unlinkSync(file);

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// IDM-safe download
router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../files/resources', filename);
  res.download(filepath, filename, err => {
    if (err) res.status(404).json({ message: 'File not found' });
  });
});

module.exports = router;
