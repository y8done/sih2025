const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); 
const Project = require('./models/Project');
const CompanyDefaults = require('./models/CompanyDefaults'); // Uses the expanded parameter model

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ------------------------------------------
// 1. MONGODB CONNECTION
// NOTE: Ensure your IP is whitelisted in MongoDB Atlas for this to work.
// ------------------------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err)); 

// ------------------------------------------
// 2. DATA PERSISTENCE & DEFAULTS ROUTES
// ------------------------------------------

// A. Endpoint to SAVE a new simulation project
app.post('/api/project', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// B. Endpoint to SET/UPDATE company-specific defaults
app.post('/api/defaults/:companyId', async (req, res) => {
  const companyId = req.params.companyId;
  try {
    // Find and update, or create if it doesn't exist (upsert)
    // This allows saving all the expanded parameters defined in the model.
    const defaults = await CompanyDefaults.findOneAndUpdate(
      { companyId: companyId },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(defaults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// C. Endpoint to FETCH company-specific defaults
app.get('/api/defaults/:companyId', async (req, res) => {
  const companyId = req.params.companyId;
  try {
    const defaults = await CompanyDefaults.findOne({ companyId: companyId });
    // Return an empty object if not found; frontend will use system defaults
    res.json(defaults || {}); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ------------------------------------------
// 3. API GATEWAY ROUTES (Forward to Python: http://localhost:8000)
// ------------------------------------------

// A. AI Imputation (AI Auto-Fill)
app.post('/api/impute', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:8000/impute', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling Python AI model for imputation:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to impute data. Check Python server console.' });
    }
});

// B. Simulation Run
app.post('/api/simulate', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:8000/simulate', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling Python AI model for simulation:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to run simulation. Check Python server console.' });
    }
});

// C. PDF Report Generation
app.post('/api/report', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:8000/report', req.body, {
            responseType: 'arraybuffer' 
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=lca_report.pdf');
        res.send(pythonResponse.data);

    } catch (error) {
        console.error('Error generating report:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate report. Check Python server console.' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
