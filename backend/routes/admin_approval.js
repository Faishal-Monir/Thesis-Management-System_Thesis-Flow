const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Userdata = require('../models/schemas').Userdata;
const Approval = require('../models/schemas').Approval;

// PUT endpoint to approve student/faculty and remove from approval
router.put('/approve/:student_id', async (req, res) => {
    const { student_id } = req.params;
    const { usr_type, status } = req.body;

    try {
        if (!usr_type || status === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields: usr_type and status are required' 
            });
        }

        // Update Userdata Schema
        const updatedUser = await Userdata.findOneAndUpdate(
            { student_id: student_id },
            { 
                usr_type: usr_type,
                status: status
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ 
                error: 'User not found in userdata collection' 
            });
        }


        
        // Delete from Approval Schema (sup_id is same as student_id)
        const deletedApproval = await Approval.findOneAndDelete(
            { sup_id: student_id }
        );

        if (!deletedApproval) {
            console.warn(`No approval record found for student_id: ${student_id}`);
        }

        res.status(200).json({
            message: 'User approved and removed from approval successfully',
            updatedUser: {
                Name: updatedUser.Name,
                student_id: updatedUser.student_id,
                mail: updatedUser.mail,
                usr_type: updatedUser.usr_type,
                status: updatedUser.status
            },
            deletedApproval: deletedApproval ? {
                sup_id: deletedApproval.sup_id,
                type: deletedApproval.type,
                status: deletedApproval.status
            } : null
        });

    } catch (error) {
        console.error('Error in approval process:', error);
        res.status(500).json({ 
            error: 'Internal server error during approval process',
            details: error.message 
        });
    }
});

// GET endpoint to show all approval details
router.get('/approve', async (req, res) => {
    try {
        const allApprovals = await Approval.find({});
        
        if (!allApprovals || allApprovals.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(allApprovals);

    } catch (error) {
        console.error('Error fetching all approvals:', error);
        res.status(500).json([]); 
    }
});


// GET endpoint to check approval status for specific student (kept for backward compatibility)
router.get('/approve/:student_id', async (req, res) => {
    const { student_id } = req.params;

    try {
        const approvalRecord = await Approval.findOne({ sup_id: student_id });
        const userRecord = await Userdata.findOne({ student_id: student_id });

        if (!approvalRecord && !userRecord) {
            return res.status(404).json({ 
                error: 'No records found for this student ID' 
            });
        }

        res.status(200).json({
            approvalRecord: approvalRecord || null,
            userRecord: userRecord ? {
                Name: userRecord.Name,
                student_id: userRecord.student_id,
                mail: userRecord.mail,
                usr_type: userRecord.usr_type,
                status: userRecord.status
            } : null
        });

    } catch (error) {
        console.error('Error fetching approval status:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

module.exports = router;
