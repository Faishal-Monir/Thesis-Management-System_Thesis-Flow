const express = require('express');
const Resource = require('../models/schemas').Resources; 
const router = express.Router();



// GET /api/resources - Retrieve all saved link sets
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ _id: -1 });
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// POST /api/resources - Add a new set of links
router.post('/', async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ message: 'links must be a non-empty array of URLs.' });
    }

    const newResource = new Resource({ links });
    const saved = await newResource.save();
    res.json({message: 'Resource added successfully'});

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /resources/:resourceId - Update links for a specific resource
router.put('/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { links } = req.body;

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ message: 'links must be a non-empty array' });
    }

    const valid = links.every(link => /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(link));
    if (!valid) {
      return res.status(400).json({ message: 'One or more links are invalid URLs.' });
    }

    const updated = await Resource.findByIdAndUpdate(
      resourceId,
      { links },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json({ message: 'Links updated successfully', resource: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});


// DELETE /resources/:resourceId - Delete a specific resource by ID
router.delete('/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;

    const deleted = await Resource.findByIdAndDelete(resourceId);

    if (!deleted) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});



module.exports = router;