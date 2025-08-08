const express = require("express");
const router = express.Router();
const Thesis = require("../models/schemas").Thesis; 

// GET /thesisDefer
router.get("/", async (req, res) => {
  try {
    const theses = await Thesis.find({}, { thesis_id: 1, defer: 1, _id: 0 });
    res.json(theses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /thesisDefer
router.put("/", async (req, res) => {
  try {
    const { thesis_id, defer } = req.body;
    if (![0, 1].includes(defer)) {
      return res.status(400).json({ error: "Defer value must be 0 or 1" });
    }

    const updated = await Thesis.findOneAndUpdate(
      { thesis_id },
      { defer },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Thesis not found" });
    }

    res.json({ message: "Defer value updated", thesis: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
