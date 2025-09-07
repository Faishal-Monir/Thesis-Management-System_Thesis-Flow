const express = require('express');
const router = express.Router();
const { Thesis, Groups, Userdata } = require('../models/schemas');


// Try to import nodemailer safely
let nodemailer;
let emailTransporter = null;


try {
  nodemailer = require('nodemailer');
  emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'cse471project@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
} catch (error) {}


// Helper function for sending thesis registration emails
const sendThesisRegistrationEmail = async (recipients, emailData) => {
  // Check if email transporter is available
  if (!emailTransporter) {
    return { success: false, message: 'Email service not available' };
  }

  const { groupId, supervisorId, topic, abstract, thesisId } = emailData;

  // Fetch supervisor name from Userdata
  let supervisorName = supervisorId;
  try {
    const supervisor = await Userdata.findOne({ student_id: supervisorId });
    if (supervisor && supervisor.Name) {
      supervisorName = supervisor.Name;
    }
  } catch (e) {
    // fallback: use supervisorId only
  }

  const subject = `Thesis Registration Successful - Group ID ${groupId}`;
  const message = `
    Dear Team,

    Congratulations! Group ID ${groupId} has registered successfully under Supervisor ${supervisorId}.

    Registration Details:
    • Group ID: ${groupId}
    • Thesis ID: ${thesisId}
    • Supervisor ID: ${supervisorId}
      Supervisor Name: ${supervisorName}
    • Topic: ${topic}
    • Abstract: ${abstract}

    Your Thesis ID is ${thesisId}. Thank you.

    Best regards,
    BRAC University Thesis Management System
  `;

  const emailPromises = recipients.map(email => {
    // Determine if it's a student or faculty email for personalized greeting
    const isStudent = email.endsWith('@g.bracu.ac.bd');
    const isFaculty = email.endsWith('@bracu.ac.bd');

    let greeting = 'Dear Team Member';
    if (isStudent) greeting = 'Dear Student';
    if (isFaculty) greeting = 'Dear Faculty';

    return emailTransporter.sendMail({
      from: process.env.EMAIL_USER || 'cse471project@gmail.com',
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">Thesis Registration Successful!</h2>
          <p>${greeting},</p>
          <p>Congratulations! <strong>Group ID ${groupId}</strong> has registered successfully under <strong>Supervisor ${supervisorId}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="color: #374151; margin-top: 0;">Registration Details:</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 5px 0;"><strong>Group ID:</strong> ${groupId}</li>
              <li style="padding: 5px 0;"><strong>Thesis ID:</strong> ${thesisId}</li>
              <li style="padding: 5px 0;"><strong>Supervisor ID:</strong> ${supervisorId}</li>
              <li style="padding: 5px 0;"><strong>Supervisor Name:</strong> ${supervisorName}</li>
              <li style="padding: 5px 0;"><strong>Topic:</strong> ${topic}</li>
              <li style="padding: 5px 0;"><strong>Abstract:</strong> ${abstract}</li>
            </ul>
          </div>
          
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">Your Thesis ID is ${thesisId}. Thank you.</p>
          </div>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>BRAC University Thesis Management System</strong>
          </p>
        </div>
      `
    });
  });

  try {
    await Promise.all(emailPromises);
    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


// ------------------- THESIS ROUTES -------------------


// POST /thesis/register - Register a thesis
router.post('/register', async (req, res) => {
  try {
    const { group_id, abstract, topic, student_id } = req.body; // student_id = faculty

    // Verify faculty exists
    const faculty = await Userdata.findOne({ student_id, usr_type: 'Faculty' });
    if (!faculty) return res.status(400).json({ error: 'Invalid faculty ID' });

    // Verify group exists
    const group = await Groups.findOne({ id: group_id });
    if (!group) return res.status(400).json({ error: 'Group not found' });

    // Create thesis
    const thesis = new Thesis({
      thesis_id: group_id,
      group_id,
      student_ids: group.student_id,
      topic,
      supervisor_id: student_id,
      abstract
    });

    await thesis.save();

    group.isRegistered = 1;
    await group.save(); // Update group status

    // Try to send registration emails
    let emailResult = { success: false, message: 'Email service not available' };
    
    if (emailTransporter) {
      try {
        // Get all group member emails
        const students = await Userdata.find({ 
          student_id: { $in: group.student_id } 
        });
        
        // Collect all recipient emails
        const studentEmails = students.map(student => student.mail);
        const allRecipients = [...studentEmails, faculty.mail];

        // Send emails
        emailResult = await sendThesisRegistrationEmail(allRecipients, {
          groupId: group_id,
          supervisorId: student_id,
          topic,
          abstract,
          thesisId: thesis.thesis_id
        });
        
      } catch (emailError) {
        emailResult = { success: false, message: emailError.message };
      }
    }

    // Always return success response (email failure doesn't stop registration)
    res.status(201).json({ 
      message: 'Thesis registered successfully', 
      thesis, 
      emailSent: emailResult.success,
      emailMessage: emailResult.message
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /thesis - Fetch all theses with student info
router.get('/', async (req, res) => {
  try {
    const theses = await Thesis.find();
    const detailedTheses = await Promise.all(
      theses.map(async t => {
        const students = await Userdata.find({ student_id: { $in: t.student_ids } });
        return { ...t._doc, students };
      })
    );
    res.status(200).json(detailedTheses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /thesis/:id - Fetch thesis by thesis_id with student info
router.get('/:id', async (req, res) => {
  try {
    const thesis = await Thesis.findOne({ thesis_id: req.params.id });
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    const students = await Userdata.find({ student_id: { $in: thesis.student_ids } });
    res.status(200).json({ ...thesis._doc, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /thesis/:id - Update thesis
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const thesis = await Thesis.findOneAndUpdate(
      { thesis_id: req.params.id },
      updates,
      { new: true }
    );
    if (!thesis) return res.status(404).json({ error: 'Thesis not found' });

    res.status(200).json({ message: 'Thesis updated', thesis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
