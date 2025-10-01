const mongoose = require('mongoose');

const companyDefaultsSchema = new mongoose.Schema({
  // Unique ID to link parameters to a specific company/user. 
  companyId: {
    type: String,
    required: true,
    unique: true
  },
  
  // --- Expanded Custom Defaults for LCA Inputs ---
  
  // 1. Core Energy & Emissions Factors (Used for imputation when Energy/CO2 fields are empty)
  co2_per_kwh_extraction: { 
    type: Number, 
    default: 0.5, // kg CO2 emitted per kWh consumed during extraction
    min: 0
  }, 
  co2_per_kwh_manufacturing: { 
    type: Number, 
    default: 0.35, // kg CO2 emitted per kWh consumed during manufacturing
    min: 0
  },
  
  // 2. Yield & Efficiency (Used for End-of-Life modeling)
  recycling_yield_default: { 
    type: Number, 
    default: 85, // Default percentage yield of metal recovered at EoL
    min: 0,
    max: 100
  }, 
  
  // 3. Cost Factors (Used for cost imputation/sensitivity)
  transport_cost_per_km_default: {
    type: Number,
    default: 0.005, // USD cost per km transported (e.g., for standard truck)
    min: 0
  },
  
  // 4. Energy Averages (Used as fallback for energy fields)
  avg_energy_extraction_mj: { 
    type: Number, 
    default: 250, // Average energy used per unit mass during extraction (MJ)
    min: 0
  },
  avg_energy_manufacturing_mj: {
    type: Number,
    default: 6, // Average energy used per unit mass during manufacturing (MJ)
    min: 0
  },
  
  // Placeholder for materials traceability/blockchain integration (future feature)
  material_traceability_score: { type: Number, default: 0.7 }, 
});

module.exports = mongoose.model('CompanyDefaults', companyDefaultsSchema);
