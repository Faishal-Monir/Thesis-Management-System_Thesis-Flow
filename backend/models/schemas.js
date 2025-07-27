const mongoose = require('mongoose');

// Userdata Schema
const userdataSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  student_id: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  Password: { type: String, required: true }, // encrypted
  usr_type: { type: String, required: true }, // 'Student' or 'Faculty'
  status: { type: Number, required: true } // 1 or 0
}, { collection: 'userdata' });

// Groups Schema
const groupsSchema = new mongoose.Schema({
  id: { type: String, required: true },
  student_id: { type: String, required: true }
}, { collection: 'groups' });

// Thesis Schema
const thesisSchema = new mongoose.Schema({
  thesis_id: { type: String, required: true },
  student_id: { type: String, required: true },
  topic: { type: String, required: true },
  supervisor_id: { type: String, required: true },
  progress: { type: Number, enum: [1, 2, 3], required: true },
  feedback: { type: String },
  defer: { type: Number, enum: [0, 1], default: 0 },
  Abstract: { type: String },
  RaTa: { type: String } // id
}, { collection: 'thesis' });

// Synopsis Schema
const synopsisSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  name: { type: String, required: true },
  mail: { type: String, required: true },
  topic: { type: String, required: true },
  status: { type: Number, enum: [0, 1], required: true }
}, { collection: 'synopsis' });

// Resources Schema
const resourcesSchema = new mongoose.Schema({
  type: { type: Number, enum: [1, 2, 3], required: true },
  links: { type: [String], required: true } // array of strings
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

const approvalSchema = new mongoose.Schema({
  sup_id: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: Number, enum: [0, 1], default: 0 }
}, { collection: 'approval' });

module.exports = {
  Userdata: mongoose.model('Userdata', userdataSchema),
  Groups: mongoose.model('Groups', groupsSchema),
  Thesis: mongoose.model('Thesis', thesisSchema),
  Synopsis: mongoose.model('Synopsis', synopsisSchema),
  Resources: mongoose.model('Resources', resourcesSchema),
  Consultation: mongoose.model('Consultation', consultationSchema),
  Domain: mongoose.model('Domain', domainSchema),
  Approval: mongoose.model('Approval', approvalSchema)
};
