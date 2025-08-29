const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Thesis = require('../models/schemas').Thesis;

// Multer storage for thesis_progress
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../files/thesis_progress');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });



// Upload a progress report
router.post("/:thesis_id", upload.single("report"), async (req, res) => {
  try {
    const thesisId = Number(req.params.thesis_id);
    const { stage } = req.body;

    if (!["P1", "P2", "P3"].includes(stage))
      return res.status(400).json({ message: "Invalid stage" });

    if (!req.file) return res.status(400).json({ message: "Report file required" });

    const thesis = await Thesis.findOne({ thesis_id: thesisId });
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    // Workflow enforcement
    const stageNumber = { P1: 1, P2: 2, P3: 3 };
    if (stageNumber[stage] !== thesis.progress + 1)
      return res.status(400).json({ message: `Cannot submit ${stage} at current progress` });

    // Save file path
    thesis.reports[stage] = `/files/thesis_progress/${req.file.filename}`;
    thesis.progress = stageNumber[stage];

    await thesis.save();
    res.status(200).json({ message: `${stage} submitted successfully`, thesis });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// GET all thesis progress
router.get('/', async (req, res) => {
  try {
    const allThesis = await Thesis.find({}, 'thesis_id group_id supervisor_id progress reports');
    res.status(200).json(allThesis);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

/// GET /thesis_progress/:thesis_id
router.get("/:thesis_id", async (req, res) => {
  try {
    const { thesis_id } = req.params;

    const thesis = await Thesis.findOne({ thesis_id: Number(thesis_id) });

    if (!thesis) {
      return res.status(404).json({ message: "Thesis not found" });
    }

    res.json(thesis);
  } catch (err) {
    console.error("Error fetching thesis:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
