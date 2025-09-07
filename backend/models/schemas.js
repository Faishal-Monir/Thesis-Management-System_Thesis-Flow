const mongoose = require('mongoose');

// Userdata Schema
const userdataSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  student_id: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  Password: { type: String, required: true }, // encrypted
  usr_type: { type: String, required: true }, // 'Student' or 'Faculty'
  status: { type: Number, required: true }, // 1 or 0
  profile_pic: { type: String, default: "" } // URL of profile picture
}, { collection: 'userdata' });


// Thesis Schema
const thesisSchema = new mongoose.Schema({
  thesis_id: { type: Number, required: true, unique: true }, // same as group id
  group_id: { type: Number, required: true },
  student_ids: { type: [String], required: true }, // all student IDs from the group
  topic: { type: String, required: true },
  supervisor_id: { type: String, required: true }, // verified faculty id
  progress: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  feedback: {
    P1: { type: String, trim: true, default: "" },
    P2: { type: String, trim: true, default: "" },
    P3: { type: String, trim: true, default: "" }
  },
  defer: { type: Number, enum: [0, 1], default: 0 },
  defer_status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
  abstract: { type: String },
  RaTa: { type: String }, 
  updated_topic: { type: Number, enum: [0, 1], default: 0 },
  correction_request: { type: Boolean, default: false }, // new: student requested correction
  correction_approved: { type: Boolean, default: false }, // new: faculty approved correction
  reports: { 
    P1: { type: String, trim: true, default: null },
    P2: { type: String, trim: true, default: null},
    P3: { type: String, trim: true, default: null}
  }
}, { collection: 'thesis' });

// Synopsis Schema
const synopsisSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  syn_id: { type: Number, required: true },
  name: { type: String, required: true },
  mail: { type: String, required: true },
  topic: { type: String, required: true },
  status: { type: Number, enum: [0, 1], required: true }
}, { collection: 'synopsis' });


// Resources Schema
const resourcesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  filePath: {
    type: String,
    required: true, // store relative path like /files/resources/filename.pdf
    trim: true,
  }
}, { collection: 'resources' });


// Consultation Schema
const consultationSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  group_thesis_id: { type: String, required: true },
  status: { type: Number, enum: [0, 1], default: 0 },
  msg: { type: String }
}, { collection: 'consultation' });

// Domain Schema
const domainSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  domain: { type: String, required: true },
  Field: { type: String, required: true }
}, { collection: 'domain' });

// Approval Schema
const approvalSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  type: { type: String, required: true },
  msg: { type: String, required: false },
  status: { type: Number, enum: [0, 1], default: 0 }
}, { collection: 'approval' });



const facultyApprovalSchema = new mongoose.Schema({
  faculty_id: { type: String, required: true },
  event: [{
    student_id: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Number, enum: [0, 1], required: true }
  }]
}, { collection: 'faculty_approvals' });



// // Student Thesis Proposal Schema - Updated
const studentProposalSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  domain: { type: String, required: true },
  idea: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Interested', 'Rejected'], default: 'Pending' },
  updated_by: { 
    faculty_id: { type: String, default: null },
    name: { type: String, default: null },
    email: { type: String, default: null }
  }
}, { collection: 'student_proposals' });

// Groups Schema
const groupsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  student_id: { type: [String], required: true }, // array of student IDs
  isRegistered: { type: Number, enum: [0, 1], default: 0 }, // 1 = registered, 0 = not registered
 },{ collection: 'groups' });

// Domain list Schema
const domain = new mongoose.Schema({
  id_no: { type: Number, required: true, unique: true },
  domain_subject: { type: String, required: true }
}, { collection: 'domain_list' });


module.exports = {
  Userdata: mongoose.model('Userdata', userdataSchema),
  Groups: mongoose.model('Groups', groupsSchema),
  Thesis: mongoose.model('Thesis', thesisSchema),
  Synopsis: mongoose.model('Synopsis', synopsisSchema),
  Resources: mongoose.model('Resources', resourcesSchema),
  Consultation: mongoose.model('Consultation', consultationSchema),
  Domain: mongoose.model('Domain', domainSchema),
  Approval: mongoose.model('Approval', approvalSchema),
  StudentProposal: mongoose.model('StudentProposal', studentProposalSchema),
  DomainList: mongoose.model('DomainList', domain)
  ,FacultyApproval: mongoose.model('FacultyApproval', facultyApprovalSchema)
};

