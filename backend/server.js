const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // Add axios for HTTP requests

// NOTE: You'll need to create a Project.js model file if you use this line
// const Project = require('./models/Project');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// NOTE: You'll need to set up a MONGO_URI in a .env file if you use this block
// mongoose.connect(process.env.MONGO_URI, {
//  useNewUrlParser: true,
//  useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// NOTE: You'll need to create a Project.js model file if you use this route
// app.post('/api/project', async (req, res) => {
//   try {
//     const project = new Project(req.body);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

app.post('/api/simulate', async (req, res) => {
  try {
    // Forward the request to the Python FastAPI server
    const response = await axios.post('http://localhost:8000/simulate', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Python backend:', error.message);
    res.status(500).json({ error: 'Failed to connect to the AI model backend.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));