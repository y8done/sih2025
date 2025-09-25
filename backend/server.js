const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// NOTE: You'll need to create a Project.js model file if you use this line
// const Project = require('./models/Project');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// NOTE: You'll need to set up a MONGO_URI in a .env file if you use this block
// mongoose.connect(process.env.MONGO_URI, {
//  useNewUrlParser: true,
//  useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// NOTE: You'll need to create a Project.js model file if you use this route
// app.post('/api/project', async (req, res) => {
//   try {
//     const project = new Project(req.body);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// API to call the Python AI model for data imputation
app.post('/api/impute', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:8000/impute', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling Python AI model for imputation:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to impute data. Please check the Python server.' });
    }
});

// API to call the Python AI model for simulation
app.post('/api/simulate', async (req, res) => {
    try {
        // Forward the request body to the Python FastAPI server
        const pythonResponse = await axios.post('http://localhost:8000/simulate', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling Python AI model for simulation:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to run simulation. Please check the Python server.' });
    }
});

// API to generate and download a PDF report
app.post('/api/report', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:8000/report', req.body, {
            responseType: 'arraybuffer' // Handle binary data
        });

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=lca_report.pdf');

        // Send the PDF data back to the client
        res.send(pythonResponse.data);

    } catch (error) {
        console.error('Error generating report:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate report. Please check the Python server.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
