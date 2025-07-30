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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
