const express = require("express");
const router = express.Router();
const Thesis = require("../models/schemas").Thesis; 

// Example GET /thesis_defer
router.get("/", async (req, res) => {
  try {
    const theses = await Thesis.find({}, {
      thesis_id: 1,
      student_ids: 1,
      progress: 1,
      defer_status: 1,
      supervisor_id: 1, // needed to filter by faculty if you want
    });

    // map to frontend format
    const result = theses.map(t => ({
      thesis_id: t.thesis_id,
      student_ids: t.student_ids,
      progress: t.progress || 0,
      defer_status: t.defer_status || "none",
      supervisor_id: t.supervisor_id
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// PUT /thesis_defer – student requests defer
router.put("/", async (req, res) => {
  try {
    const { thesis_id, defer } = req.body; // defer = 1 for request

    const thesis = await Thesis.findOne({ thesis_id });
    if (!thesis) return res.status(404).json({ error: "Thesis not found" });

    if (thesis.progress >= 3) {
      return res.status(400).json({ error: "Cannot defer: progress already 3 or more" });
    }

    if (defer !== 1) {
      return res.status(400).json({ error: "Invalid defer request" });
    }

    // Update defer_status to "pending"
    thesis.defer_status = "pending"; // add this field to your schema if not exists
    await thesis.save();

    res.json({
      message: "Defer request submitted",
      thesis: {
        thesis_id: thesis.thesis_id,
        student_ids: thesis.student_ids,
        progress: thesis.progress,
        defer_status: thesis.defer_status
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /thesis_defer/decision – faculty approves/rejects a defer request
router.put("/decision", async (req, res) => {
  try {
    const { thesis_id, decision } = req.body; // decision = "approve" or "reject"

    // Validate decision value
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ error: "Invalid decision. Must be 'approve' or 'reject'." });
    }

    // Find the thesis by ID
    const thesis = await Thesis.findOne({ thesis_id });
    if (!thesis) return res.status(404).json({ error: "Thesis not found" });

    // Update defer_status based on decision
    thesis.defer_status = decision === "approve" ? "approved" : "rejected";
    await thesis.save();

    // Respond with updated thesis
    res.json({
      message: `Defer request ${decision}d successfully`,
      thesis: {
        thesis_id: thesis.thesis_id,
        student_ids: thesis.student_ids,
        progress: thesis.progress,
        defer_status: thesis.defer_status,
      },
    });
  } catch (err) {
    console.error("Error updating defer decision:", err);
    res.status(500).json({ error: err.message });
  }
});


// Admin resets a thesis defer back to "none"
router.put('/reset', async (req, res) => {
  try {
    const { thesis_id } = req.body;

    if (!thesis_id) {
      return res.status(400).json({ error: 'Thesis ID is required' });
    }

    // Update the defer_status to 'none'
    const thesis = await Thesis.findOneAndUpdate(
      { thesis_id },
      { defer_status: 'none' },
      { new: true }
    );

    if (!thesis) {
      return res.status(404).json({ error: 'Thesis not found' });
    }

    res.json({ success: true, message: 'Defer status reset successfully', data: thesis });
  } catch (err) {
    console.error('Error resetting defer:', err);
    res.status(500).json({ error: 'Server error while resetting defer' });
  }
});



module.exports = router;


