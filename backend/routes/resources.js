const express = require('express');
const Resource = require('../models/schemas').Resources; 
const router = express.Router();


// GET /api/resources - Retrieve all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ _id: -1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/resources - Add a new resource with title and link
router.post('/', async (req, res) => {
  try {
    const { title, link } = req.body;

    if (!title || !link) {
      return res.status(400).json({ message: 'Title and link are required.' });
    }

    const urlRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
    if (!urlRegex.test(link)) {
      return res.status(400).json({ message: 'Invalid URL format.' });
    }

    const newResource = new Resource({ title: title.trim(), link: link.trim() });
    const savedResource = await newResource.save();

    res.status(201).json(savedResource);

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/resources/:id - Update title and/or link of a resource
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link } = req.body;

    if (!title && !link) {
      return res.status(400).json({ message: 'At least one of title or link must be provided.' });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (link) {
      const urlRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
      if (!urlRegex.test(link)) {
        return res.status(400).json({ message: 'Invalid URL format.' });
      }
      updateData.link = link.trim();
    }

    const updatedResource = await Resource.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json(updatedResource);

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/resources/:id - Delete a resource by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedResource = await Resource.findByIdAndDelete(id);

    if (!deletedResource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json({ message: 'Resource deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


module.exports = router;