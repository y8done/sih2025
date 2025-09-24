const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  metal: { type: String, required: true },
  route: { type: String, required: true },
  energyUse: Number,
  transport: String,
  endOfLife: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
