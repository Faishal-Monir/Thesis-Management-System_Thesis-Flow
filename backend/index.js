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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));