const express = require("express");
const router = express.Router();
const { Thesis } = require("../models/schemas");

// 1️⃣ Request correction
router.put("/request", async (req, res) => {
  const { thesis_id } = req.body;
  if (!thesis_id) return res.status(400).json({ error: "thesis_id is required." });

  const thesis = await Thesis.findOne({ thesis_id });
  if (!thesis) return res.status(404).json({ error: "Thesis not found." });
  if (thesis.correction_request) return res.status(400).json({ error: "Correction already requested." });

  thesis.correction_request = true;
  await thesis.save();

  res.status(200).json({ message: "Correction request submitted.", thesis });
});

// 2️⃣ Approve correction
router.put("/approve", async (req, res) => {
  const { thesis_id, approve } = req.body;
  if (!thesis_id || !approve) return res.status(400).json({ error: "Invalid request." });

  const thesis = await Thesis.findOne({ thesis_id });
  if (!thesis) return res.status(404).json({ error: "Thesis not found." });
  if (!thesis.correction_request) return res.status(400).json({ error: "No correction request to approve." });

  thesis.correction_approved = true;
  await thesis.save();

  res.status(200).json({ message: "Correction approved.", thesis });
});

// 4️⃣ Student updates topic/abstract (only after approval)
// Admin resets all correction flags
router.put("/reset", async (req, res) => {
  const { thesis_id } = req.body;
  if (!thesis_id) return res.status(400).json({ error: "thesis_id is required." });

  const thesis = await Thesis.findOne({ thesis_id });
  if (!thesis) return res.status(404).json({ error: "Thesis not found." });

  // Reset all correction-related flags
  thesis.updated_topic = 0;
  thesis.correction_approved = false;
  thesis.correction_request = false;

  await thesis.save();

  res.status(200).json({ message: "Correction reset successfully.", thesis });
});


// 3️⃣ Update topic/abstract (only after approval)
router.put("/:id", async (req, res) => {
  const { topic, abstract } = req.body;
  const thesis_id = req.params.id;

  if (!topic || !abstract) return res.status(400).json({ error: "Both topic and abstract are required." });

  const thesis = await Thesis.findOne({ thesis_id });
  if (!thesis) return res.status(404).json({ error: "Thesis not found." });
  if (!thesis.correction_approved) return res.status(403).json({ error: "Correction not approved yet." });

  thesis.topic = topic;
  thesis.abstract = abstract;
  thesis.updated_topic = 1;

  await thesis.save();
  res.status(200).json({ message: "Thesis updated successfully.", thesis });
});


module.exports = router;
