const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Domain update
const domainUpdateRoute = require('./routes/domain_update');
app.use('/update', domainUpdateRoute);

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

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
