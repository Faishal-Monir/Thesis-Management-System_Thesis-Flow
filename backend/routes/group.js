const express = require('express');
const router = express.Router();
const { Groups, Userdata } = require('../models/schemas');


// GET /groups - fetch all groups with student info
router.get('/', async (req, res) => {
  try {
    const groups = await Groups.find();

    const detailedGroups = await Promise.all(
      groups.map(async (g) => {
        const students = await Userdata.find({ student_id: { $in: g.student_id } });
        return {
          id: g.id,                // keep id
          student_id: g.student_id, // keep group members
          isRegistered: g.isRegistered, // ✅ make sure this is visible
          students                  // full student objects
        };
      })
    );

    res.status(200).json(detailedGroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET /groups/:id - fetch group by id with student info
router.get('/:id', async (req, res) => {
 try {
   const group = await Groups.findOne({ id: req.params.id });
   if (!group) return res.status(404).json({ error: 'Group not found' });


   const students = await Userdata.find({ student_id: { $in: group.student_id } });
   res.status(200).json({ ...group._doc, students });
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});


// POST /groups - create a new group with auto-increment ID
router.post('/', async (req, res) => {
 try {
   const { student_id } = req.body;
   if (!student_id || !Array.isArray(student_id)) {
     return res.status(400).json({ error: 'student_id array is required' });
   }


   // Group size validation
   if (student_id.length < 3 || student_id.length > 5) {
     return res.status(400).json({ error: 'Group must have 3 to 5 students' });
   }


   // Check each student
   for (let sid of student_id) {
     const user = await Userdata.findOne({ student_id: sid });
     if (!user) return res.status(404).json({ error: `Student ${sid} not found` });
     if (user.usr_type !== 'Student') {
       return res.status(400).json({ error: `User ${sid} is not a student` });
     }
     const existingGroup = await Groups.findOne({ student_id: sid });
     if (existingGroup) {
       return res.status(400).json({ error: `Student ${sid} is already in a group` });
     }
   }


   // Auto-generate next group ID
   const lastGroup = await Groups.findOne().sort({ id: -1 });
   const newId = lastGroup ? lastGroup.id + 1 : 1;


   const group = new Groups({ id: newId, student_id });
   await group.save();
   res.status(201).json(group);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});


// PUT /groups/:id - add a student to a group
router.put('/:id', async (req, res) => {
 try {
   const { student_id } = req.body;
   if (!student_id) return res.status(400).json({ error: 'student_id is required' });


   const group = await Groups.findOne({ id: req.params.id });
   if (!group) return res.status(404).json({ error: 'Group not found' });


   // Prevent duplicate student
   if (group.student_id.includes(student_id)) {
     return res.status(400).json({ error: 'Student already in this group' });
   }


   // Check student exists and is a student
   const user = await Userdata.findOne({ student_id });
   if (!user) return res.status(404).json({ error: 'Student not found' });
   if (user.usr_type !== 'Student') {
     return res.status(400).json({ error: 'Only students can be added to a group' });
   }


   // Check if student is already in another group
   const existing = await Groups.findOne({ student_id });
   if (existing) return res.status(400).json({ error: 'Student already in another group' });


   // Check max group size
   if (group.student_id.length >= 5) {
     return res.status(400).json({ error: 'Group cannot have more than 5 students' });
   }


   group.student_id.push(student_id);
   await group.save();
   res.status(200).json(group);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});


// DELETE /groups/:id - delete a group by id
router.delete('/:id', async (req, res) => {
 try {
   const group = await Groups.findOneAndDelete({ id: req.params.id });
   if (!group) return res.status(404).json({ error: 'Group not found' });
   res.status(200).json({ message: 'Group deleted' });
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});


// DELETE /groups/:id/student - remove a student from a group
router.delete('/:id/student', async (req, res) => {
 try {
   const { student_id } = req.body;
   if (!student_id) return res.status(400).json({ error: 'student_id is required' });


   const group = await Groups.findOne({ id: req.params.id });
   if (!group) return res.status(404).json({ error: 'Group not found' });


   // Check if student exists in the group
   if (!group.student_id.includes(student_id)) {
     return res.status(400).json({ error: 'Student not found in this group' });
   }


   // Prevent deleting below 3 students
   if (group.student_id.length <= 3) {
     return res.status(400).json({ error: 'Group must have at least 3 students' });
   }


   // Remove student
   group.student_id = group.student_id.filter(sid => sid !== student_id);
   await group.save();


   res.status(200).json({ message: `Student ${student_id} removed from group ${group.id}`, group });
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});


// GET /groups/:student_id - find the group(s) that a student belongs to
// GET /groups/student/:student_id
router.get('/student/:student_id', async (req, res) => {
  try {
    const student_id = req.params.student_id.trim(); // remove spaces

    // Find a group where the student_id array contains this student
    const group = await Groups.findOne({
      student_id: { $in: [student_id] }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.status(200).json({ group_id: group.id, isRegistered: group.isRegistered });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;