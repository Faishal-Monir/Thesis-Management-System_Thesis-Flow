// ...existing code...
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


// Serve uploaded files
app.use('/files/resources', express.static(path.join(__dirname, 'files/resources')));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('API is running');
});


// Register route
const registerRoute = require('./routes/register');
app.use('/register', registerRoute);

// View user route
const viewUserRoute = require('./routes/view_user');
app.use('/usr', viewUserRoute);

//synopsis route
const synopsisRoute = require('./routes/synopsis');
app.use('/', synopsisRoute);

// Password reset route
const passResetRoute = require('./routes/pass_reset');
app.use('/reset', passResetRoute);

// Domain routes
const domainSelectRoute = require('./routes/domain_select');
app.use('/register', domainSelectRoute);

const domainListRouter = require('./routes/domain_list');
app.use('/domainlist', domainListRouter);

// Domain update
const domainUpdateRoute = require('./routes/domain_update');
app.use('/update', domainUpdateRoute);

//Domain reset
const domainResetRoute = require('./routes/domain_select');
app.use('/domain', domainResetRoute);

// View Domain
const domainViewRoute = require('./routes/domain_select');
app.use('/domain', domainViewRoute);

// Email service route
const emailServiceRoute = require('./routes/emailservice');
app.use('/email', emailServiceRoute);

// Dashboard route
const studentDashboardRoute = require('./routes/studentDashboard');
app.use('/users', studentDashboardRoute);

// Resources route
const resourcesRoute = require('./routes/resources');
app.use('/resources', resourcesRoute);

// Student proposal route
const studentProposalRoute = require('./routes/studentProposal');
app.use('/students', studentProposalRoute);

// Admin Approval route
const adminApprovalReqRouter = require('./routes/admin_approval_req');
app.use('/', adminApprovalReqRouter);

// Admin approval processing route
const adminApprovalRouter = require('./routes/admin_approval');
app.use('/', adminApprovalRouter);

// thesis feedback route
const thesisFeedbackRouter = require('./routes/thesis_feedback');
app.use('/feedback', thesisFeedbackRouter);

// Group routes
const groupRouter = require('./routes/group');
app.use('/groups', groupRouter);

// Thesis registration routes
const thesisRegistrationRouter = require('./routes/thesis_registration');
app.use('/thesis', thesisRegistrationRouter);

// Thesis defer routes
const thesisDeferRouter = require('./routes/thesis_defer');
app.use('/thesis_defer', thesisDeferRouter);

// Thesis progress routes
const thesisProgressRouter = require('./routes/thesis_progress');
app.use('/thesis_progress', thesisProgressRouter);

// Serve thesis progress files
app.use(
  "/files/thesis_progress",
  express.static(path.join(__dirname, "files/thesis_progress"))
);

// Assign RaTa route
const assignRaTaRouter = require('./routes/assign_ra_ta');
app.use('/assignhelp', assignRaTaRouter);

// Profile picture upload cloudinary
const profileUploadRouter = require('./routes/profile_upload');
app.use('/', profileUploadRouter);

//profile update route 
const updateUserRouter = require('./routes/update_user');
app.use('/',updateUserRouter);

const thesisCorrectionRoutes = require("./routes/thesis_correction");
app.use("/thesis_correction", thesisCorrectionRoutes);


const Faculty_meeting = require('./routes/faculty_meeting');
app.use('/', Faculty_meeting);





// New domain creation route
const newDomainRouter = require('./routes/new_domain_enlistment');
app.use('/domain', newDomainRouter);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
