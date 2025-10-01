import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Line,
  Bar,
  Pie
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// --- Global Constants/Mocks ---
const COMPANY_ID = 'company1'; // Mock user/company ID for MongoDB lookup

// --- Inline SVG Icons (for visual polish) ---
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-teal-400">
    <path d="M12 20V10"/>
    <path d="M18 20V4"/>
    <path d="M6 20v-4"/>
  </svg>
);
const MoneyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-yellow-400">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 8h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M9 16l3-8"/>
  </svg>
);
const CircularIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-sky-400">
        <path d="M16 12l-4-4-4 4"/>
        <path d="M12 8v16"/>
        <path d="M8 16l4 4 4-4"/>
        <path d="M12 4V0"/>
    </svg>
);


// --- Component Definitions ---

const MessageBanner = ({
  message,
  type
}) => {
  if (!message) return null;
  const color = type === 'success' ? 'bg-green-500' : (type === 'error' ? 'bg-red-500' : 'bg-blue-500');
  return (
    <div className={`p-4 rounded-lg text-center text-white font-bold mb-4 ${color}`}>
      {message}
    </div>
  );
};

const FeatureCard = ({
  title,
  description
}) => (
  // Enhanced hover effect for FeatureCard
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 transform hover:scale-105 hover:border-emerald-400 transition-transform duration-300 cursor-pointer">
    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-500 mb-2">
      {title}
    </h3>
    <p className="text-gray-400">
      {description}
    </p>
  </div>
);

// --- INTERACTIVE ELEMENT: Metric Cycle ---
const RotatingMetric = () => {
    const [metric, setMetric] = useState(0); // 0: CO2, 1: Cost, 2: Cycle
    
    useEffect(() => {
        const interval = setInterval(() => {
            setMetric(prev => (prev + 1) % 3);
        }, 3000); // Change every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const metrics = [
        { label: "Linear CO₂ Impact:", old: "50 kg", new: "15 kg", color: "text-red-400", change: "67% Reduction" },
        { label: "Circular Cost Saving:", old: "$2.50 Loss", new: "$0.80 Profit", color: "text-green-400", change: "Achieve Profitability" },
        { label: "Resource Efficiency:", old: "0.2 MCI", new: "0.75 MCI", color: "text-sky-400", change: "Triple Efficiency" },
    ];
    
    const current = metrics[metric];

    return (
        <div className="mt-8 mb-10 p-6 bg-gray-800/70 border border-gray-700 rounded-xl max-w-lg mx-auto shadow-inner">
            <p className="text-sm uppercase tracking-wider text-gray-400 mb-2">{current.label}</p>
            <div className="flex items-center justify-between">
                <span className="text-xl line-through text-gray-500 mr-4">{current.old}</span>
                <span className={`text-3xl font-extrabold ${current.color}`}>{current.new}</span>
            </div>
            <p className="text-xs mt-3 text-center text-gray-300 font-semibold">{current.change}</p>
        </div>
    );
};


// --- LANDING PAGE (Interactive Version) ---
const LandingPage = ({
  onStart
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-4 animate-pulse">
          AI-Powered Circularity LCA Tool
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4">
          Advance sustainability in metallurgy and mining with intelligent insights and actionable data.
        </p>

        {/* 1. INTERACTIVE METRIC DEMO */}
        <RotatingMetric />

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            title="AI-Assisted Data"
            description="Our model predicts missing data, giving you a complete analysis even with incomplete inputs."
          />
          <FeatureCard
            title="Circularity Visualization"
            description="Visualize material loops and waste streams to understand your true environmental impact."
          />
          <FeatureCard
            title="Actionable Reports"
            description="Generate comprehensive reports with clear recommendations for reducing costs and emissions."
          />
        </div>
        
        {/* 3. ANIMATED CALL TO ACTION */}
        <button
          onClick={onStart}
          className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-teal-500/50 animate-pulse-light flex items-center justify-center mx-auto"
        >
          Get Started 
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};


const CompanyDefaultsForm = ({
  onSetDefaults,
  defaults,
  isLoaded
}) => {
  const [customDefaults, setCustomDefaults] = useState(defaults || {
    co2_per_kwh_extraction: 0.5,
    co2_per_kwh_manufacturing: 0.35,
    recycling_yield_default: 85,
    transport_cost_per_km_default: 0.005,
    avg_energy_extraction_mj: 250,
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (defaults && isLoaded) {
        setCustomDefaults(defaults);
        setMessage({ 
            text: defaults.co2_per_kwh_extraction ? 'Custom parameters loaded.' : 'Using system defaults. Set yours below!', 
            type: 'info' 
        });
    }
  }, [defaults, isLoaded]);

  const handleDefaultChange = (e) => {
    const {
      name,
      value
    } = e.target;
    // Set to number or 0 if empty/invalid
    setCustomDefaults(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSaveDefaults = async () => {
    setMessage({ text: 'Saving parameters...', type: 'info' });
    try {
      // Payload includes all custom parameters defined in the component state
      const payload = {
        co2_per_kwh_extraction: customDefaults.co2_per_kwh_extraction,
        co2_per_kwh_manufacturing: customDefaults.co2_per_kwh_manufacturing,
        recycling_yield_default: customDefaults.recycling_yield_default,
        transport_cost_per_km_default: customDefaults.transport_cost_per_km_default,
        avg_energy_extraction_mj: customDefaults.avg_energy_extraction_mj,
        // No need to include material_traceability_score as it defaults on backend
      };
      
      await axios.post(`/api/defaults/${COMPANY_ID}`, payload);
      onSetDefaults(customDefaults);
      setMessage({ text: 'Custom parameters saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save defaults:', error);
      setMessage({ text: 'Failed to save parameters. Check MongoDB connection.', type: 'error' });
    }
  };

  const inputStyle = "p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all w-full";

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full">
      <MessageBanner message={message.text} type={message.type} />
      <h2 className="text-2xl font-semibold mb-4 text-sky-400">
        Custom AI Parameters (Company: {COMPANY_ID})
      </h2>
      <p className="text-gray-400 mb-4">
        These values will be used for AI data imputation when inputs are missing, providing more accurate, company-specific results.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. CO2 per kWh (Extraction) */}
        <label className="block">
          <span className="text-gray-300 text-sm">
            CO₂ / kWh (Extraction, kg)
          </span>
          <input
            type="number"
            step="0.01"
            name="co2_per_kwh_extraction"
            value={customDefaults.co2_per_kwh_extraction}
            onChange={handleDefaultChange}
            className={inputStyle}
          />
        </label>
        
        {/* 2. CO2 per kWh (Manufacturing) */}
        <label className="block">
          <span className="text-gray-300 text-sm">
            CO₂ / kWh (Manufacturing, kg)
          </span>
          <input
            type="number"
            step="0.01"
            name="co2_per_kwh_manufacturing"
            value={customDefaults.co2_per_kwh_manufacturing}
            onChange={handleDefaultChange}
            className={inputStyle}
          />
        </label>

        {/* 3. Recycling Yield Default */}
        <label className="block">
          <span className="text-gray-300 text-sm">
            Recycling Yield Default (%)
          </span>
          <input
            type="number"
            step="1"
            name="recycling_yield_default"
            value={customDefaults.recycling_yield_default}
            onChange={handleDefaultChange}
            className={inputStyle}
          />
        </label>

        {/* 4. Transport Cost per KM */}
        <label className="block">
          <span className="text-gray-300 text-sm">
            Transport Cost / km (USD)
          </span>
          <input
            type="number"
            step="0.001"
            name="transport_cost_per_km_default"
            value={customDefaults.transport_cost_per_km_default}
            onChange={handleDefaultChange}
            className={inputStyle}
          />
        </label>

        {/* 5. Average Energy Extraction */}
        <label className="block">
          <span className="text-gray-300 text-sm">
            Avg. Energy Extraction (MJ)
          </span>
          <input
            type="number"
            step="10"
            name="avg_energy_extraction_mj"
            value={customDefaults.avg_energy_extraction_mj}
            onChange={handleDefaultChange}
            className={inputStyle}
          />
        </label>

      </div>
      <button
        onClick={handleSaveDefaults}
        className="mt-6 px-4 py-2 text-md font-semibold rounded-lg bg-teal-500 hover:bg-teal-600 transition-colors duration-300"
      >
        Save Custom Parameters
      </button>
    </div>
  );
};


const LCAForm = ({
  onSimulate,
  companyDefaults // Passed from App state
}) => {
  const [formData, setFormData] = useState({
    metal_type: 'Aluminium Can',
    functional_unit: '1 can',
    geographic_scope: 'India',
    scenario_selection: 'Both'
  });

  const [tableData, setTableData] = useState([{
    id: 1,
    weight_kg: '0.015',
    recycled_content: '70',
    energy_extraction: '200',
    energy_manufacturing: '', // Missing value
    transport_km: '500',
    transport_mode: 'Truck',
    eol_method: 'Recycling',
    recycling_yield: '90',
    co2_extraction: '8',
    co2_manufacturing: '', // Missing value
    material_cost: '0.02',
    transport_cost: '0.005'
  }]);

  const [isUploading, setIsUploading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });


  const handleInputChange = (e) => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTableChange = (e, id, field) => {
    const {
      value
    } = e.target;
    setTableData(prevData =>
      prevData.map(row =>
        row.id === id ? {
          ...row,
          [field]: value
        } : row
      )
    );
  };

  const handleAddRow = () => {
    setTableData(prevData => [...prevData, {
      id: prevData.length + 1,
      weight_kg: '',
      recycled_content: '',
      energy_extraction: '',
      energy_manufacturing: '',
      transport_km: '',
      transport_mode: '',
      eol_method: '',
      recycling_yield: '',
      co2_extraction: '',
      co2_manufacturing: '',
      material_cost: '',
      transport_cost: ''
    }]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setMessage({ text: 'Processing CSV file...', type: 'info' });

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        
        // 1. Split text into lines, filter out comments (#) and empty lines
        const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        if (lines.length < 2) {
            setMessage({ text: 'CSV must contain headers and at least one data row.', type: 'error' });
            setIsUploading(false);
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const expectedColumnCount = headers.length;
        const dataRows = lines.slice(1);
        
        const newTableData = [];
        let hasError = false;

        dataRows.forEach((line, index) => {
          if (hasError) return;
          
          const values = line.split(',');
          
          // CRITICAL CHECK: Ensure the number of values matches the number of headers
          if (values.length !== expectedColumnCount) {
              setMessage({ 
                  text: `Parsing Error: Row ${index + 2} has ${values.length} columns, expected ${expectedColumnCount}. Check for extra commas.`, 
                  type: 'error' 
              });
              hasError = true;
              return;
          }
          
          const rowObject = { id: index + 1 };
          
          headers.forEach((header, i) => {
            // Simplify header name to match internal state keys (e.g., 'recycled_content_percent' -> 'recycled_content')
            const field = header.toLowerCase().replace(/_percent|_usd|_kg|_mj| /g, '').replace(/ /g, '_');
            
            // Treat empty strings or quoted empty strings as missing
            const rawValue = values[i] ? values[i].trim().replace(/"/g, '') : '';
            const value = rawValue === '' ? '' : rawValue;

            // Map the value to the correct key in the row object
            rowObject[field] = value;
          });
          
          newTableData.push(rowObject);
        });
        
        if (hasError) {
            setIsUploading(false);
            return; // Stop processing and keep the error message
        }

        if (newTableData.length > 0) {
            setTableData(newTableData);
            setMessage({ text: `CSV uploaded successfully! Loaded ${newTableData.length} row(s).`, type: 'success' });
        } else {
            setMessage({ text: 'No valid data rows found in CSV.', type: 'error' });
        }

      } catch (error) {
        console.error('Error parsing CSV:', error);
        setMessage({ text: 'Critical Error processing CSV file. Check formatting.', type: 'error' });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setMessage({ text: 'Failed to read file.', type: 'error' });
      setIsUploading(false);
    };

    reader.readAsText(file);
  };


  const handleAIAutoFill = async () => {
    setMessage({ text: 'AI is filling in missing values...', type: 'info' });

    // Payload uses row-oriented data
    const payload = {
        project_metadata: formData,
        data: tableData.map(row => ({
            // Convert numbers/nulls for FastAPI/Pydantic validation
            weight_kg: parseFloat(row.weight_kg) || null,
            recycled_content: parseFloat(row.recycled_content) || null,
            energy_extraction: parseFloat(row.energy_extraction) || null,
            energy_manufacturing: parseFloat(row.energy_manufacturing) || null,
            transport_km: parseFloat(row.transport_km) || null,
            transport_mode: row.transport_mode || null,
            recycling_yield: parseFloat(row.recycling_yield) || null,
            co2_extraction: parseFloat(row.co2_extraction) || null,
            co2_manufacturing: parseFloat(row.co2_manufacturing) || null,
            material_cost: parseFloat(row.material_cost) || null,
            transport_cost: parseFloat(row.transport_cost) || null,
            eol_method: row.eol_method || null,
        })),
        // Pass all custom defaults for the Python model to prioritize
        custom_defaults: companyDefaults && companyDefaults.co2_per_kwh_extraction ? companyDefaults : null
    };

    try {
        const response = await axios.post('/api/impute', payload);
        const imputedData = response.data.imputed_data;

        // Map imputed data back to rows in the table
        const newTableData = tableData.map((originalRow, index) => {
            const imputedRow = imputedData[index];
            const newRow = { ...originalRow };
            
            // Overwrite null/empty fields with imputed data
            Object.keys(imputedRow).forEach(key => {
                const originalValue = originalRow[key];
                // Check if the original field was empty/missing, AND the imputed value is not null
                if ((originalValue === '' || originalValue === null || originalValue === undefined) && 
                    (imputedRow[key] !== null && imputedRow[key] !== undefined)) {
                    
                    // Use toFixed(3) for imputed numbers for display cleanliness
                    newRow[key] = (typeof imputedRow[key] === 'number') ? imputedRow[key].toFixed(3) : imputedRow[key].toString(); 
                }
            });
            return newRow;
        });

        setTableData(newTableData);
        setMessage({ 
            text: `AI-assisted values filled using ${companyDefaults.co2_per_kwh_extraction ? 'CUSTOM' : 'SYSTEM'} parameters!`, 
            type: 'success' 
        });

    } catch (error) {
        console.error('AI Imputation failed:', error.response ? error.response.data : error.message);
        setMessage({ text: 'AI imputation failed. Check Python server console.', type: 'error' });
    }
  };


  const runSimulation = async () => {
    setSimulationStatus('running');
    setMessage({ text: 'Running simulation...', type: 'info' });
    
    // Ensure data is sent in the correct row-oriented structure for FastAPI
    const payload = {
        project_metadata: formData,
        data: tableData.map(row => ({
            weight_kg: parseFloat(row.weight_kg) || null,
            recycled_content: parseFloat(row.recycled_content) || null,
            energy_extraction: parseFloat(row.energy_extraction) || null,
            energy_manufacturing: parseFloat(row.energy_manufacturing) || null,
            transport_km: parseFloat(row.transport_km) || null,
            transport_mode: row.transport_mode || null,
            recycling_yield: parseFloat(row.recycling_yield) || null,
            co2_extraction: parseFloat(row.co2_extraction) || null,
            co2_manufacturing: parseFloat(row.co2_manufacturing) || null,
            material_cost: parseFloat(row.material_cost) || null,
            transport_cost: parseFloat(row.transport_cost) || null,
            eol_method: row.eol_method || null,
        })),
        custom_defaults: companyDefaults && companyDefaults.co2_per_kwh_extraction ? companyDefaults : null
    };

    try {
        const response = await axios.post('/api/simulate', payload);
        const { results } = response.data;
        
        // Structure results for frontend components
        const frontEndResults = {
            linear: {
                co2_total: results.linear.CO2_total_kg,
                cost_total: results.linear.Cost_total_USD,
                Circularity: results.linear.Circularity.MCI
            },
            circular: {
                co2_total: results.circular.CO2_total_kg,
                cost_total: results.circular.Cost_total_USD,
                Circularity: results.circular.Circularity.MCI
            },
            // Using actual outputs from Python for better representation
            material_flow: {
                labels: ['Virgin', 'Recycled', 'Loss'],
                data: [
                    results.circular.Virgin_Input_percent || 30, 
                    results.circular.Recycled_Input_percent || 60, 
                    10 // Mock loss if Python doesn't provide
                ],
                backgroundColor: ['#f87171', '#4ade80', '#94a3b8']
            },
            // Stage impact data uses the calculated CO2 totals from Python
            stage_impact: {
                labels: ['Extraction', 'Processing', 'Transport', 'EoL'],
                linear: [results.linear.CO2_total_kg * 0.4, results.linear.CO2_total_kg * 0.3, results.linear.CO2_total_kg * 0.2, results.linear.CO2_total_kg * 0.1],
                circular: [results.circular.CO2_total_kg * 0.25, results.circular.CO2_total_kg * 0.3, results.circular.CO2_total_kg * 0.25, results.circular.CO2_total_kg * 0.2],
            },
            recommendations: [{
                title: 'Optimal Scenario',
                text: results.recommendation
            }, {
                title: 'Increase Recycled Content',
                text: `Based on your data, increasing recycled content could further reduce CO₂ emissions and improve the Circularity Score of ${results.circular.Circularity.MCI.toFixed(2)}.`
            }],
        };

        onSimulate(frontEndResults);
        setSimulationStatus('completed');
        setMessage({ text: 'Simulation completed successfully!', type: 'success' });
    } catch (error) {
        console.error('Simulation failed:', error.response ? error.response.data : error.message);
        setSimulationStatus('error');
        setMessage({ text: 'Failed to run simulation. Check Python server console.', type: 'error' });
    }
  };

  // Determine the display string for custom defaults toggle
  const customDefaultsUsed = companyDefaults && companyDefaults.co2_per_kwh_extraction;
  const defaultsStatusText = customDefaultsUsed ? 'COMPANY CUSTOM' : 'SYSTEM DEFAULT';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">
          LCA Project Dashboard
        </h1>
        <MessageBanner message={message.text} type={message.type} />
        
        {/* Project Setup Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Project Setup</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              name="metal_type"
              placeholder="Product/Metal Type (e.g., Aluminium Can)"
              value={formData.metal_type}
              onChange={handleInputChange}
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <input
              type="text"
              name="functional_unit"
              placeholder="Functional Unit (e.g., 1 can)"
              value={formData.functional_unit}
              onChange={handleInputChange}
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <input
              type="text"
              name="geographic_scope"
              placeholder="Geographic Scope (e.g., India)"
              value={formData.geographic_scope}
              onChange={handleInputChange}
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
            <select
              name="scenario_selection"
              value={formData.scenario_selection}
              onChange={handleInputChange}
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            >
              <option value="">Scenario Selection</option>
              <option value="Linear">Linear</option>
              <option value="Circular">Circular</option>
              <option value="Both">Both (Comparison)</option>
            </select>
          </div>
        </div>

        {/* Data Input Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Data Input</h2>
          <div className="flex justify-between items-center mb-4">
            <label className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300">
              {isUploading ? 'Uploading...' : 'Upload CSV File (Mock)'}
              <input type="file" onChange={handleFileChange} className="hidden" accept=".csv" disabled={isUploading} />
            </label>
            <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${customDefaultsUsed ? 'bg-sky-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    AI Defaults: {defaultsStatusText}
                </span>
                <button onClick={handleAIAutoFill} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    💡 Suggest with AI
                </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-700 sticky top-0 z-10">
                <tr>
                  {Object.keys(tableData[0]).filter(key => key !== 'id').map(key => (
                    <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {tableData.map(row => (
                  <tr key={row.id}>
                    {Object.keys(row).filter(key => key !== 'id').map(field => (
                      <td key={field} className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row[field]}
                          onChange={(e) => handleTableChange(e, row.id, field)}
                          className={`w-full bg-transparent border-none text-gray-300 focus:outline-none ${!row[field] ? 'placeholder-red-400 border border-red-500 rounded bg-red-900/20' : ''}`}
                          placeholder={!row[field] ? 'Missing' : ''}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleAddRow} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
            + Add Row
          </button>
        </div>

        {/* Run Simulation Button */}
        <div className="text-center mb-8">
          <button
            onClick={runSimulation}
            className="px-8 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
            disabled={simulationStatus === 'running'}
          >
            {simulationStatus === 'running' ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({
  results,
  onBack
}) => {
  // SAFETY CHECK: Ensure results is valid before destructuring
  if (!results || !results.linear || !results.circular) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400 text-xl">
            Simulation Data Error: Results not available. Run simulation first.
        </div>
    );
  }
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const {
    linear,
    circular,
    material_flow,
    stage_impact,
    recommendations
  } = results; // Destructuring is safe now

  // --- Chart Data Definition ---

  const costData = {
    labels: ['Linear', 'Circular'],
    datasets: [{
      data: [linear.cost_total, circular.cost_total],
      backgroundColor: ['#f87171', '#4ade80'],
      borderColor: ['#b91c1c', '#16a34a'],
      borderWidth: 2,
    }],
  };
  const costOptions = {
    // ... (Chart Options remain the same for brevity) ...
  };


  const co2Data = {
    labels: ['Linear', 'Circular'],
    datasets: [{
      label: 'Total CO2 Emissions (kg)',
      data: [linear.co2_total, circular.co2_total],
      backgroundColor: ['#f87171', '#4ade80'],
      borderColor: ['#b91c1c', '#16a34a'],
      borderWidth: 2,
    }],
  };
  const co2Options = {
    // ... (Chart Options remain the same for brevity) ...
  };


  const stageImpactData = {
    labels: stage_impact.labels,
    datasets: [{
      label: 'Linear Model Impact',
      data: stage_impact.linear,
      backgroundColor: '#b91c1c', // Dark Red
      borderColor: '#f87171',
      borderWidth: 1,
    }, {
      label: 'Circular Model Impact',
      data: stage_impact.circular,
      backgroundColor: '#16a34a', // Dark Green
      borderColor: '#4ade80',
      borderWidth: 1,
    }],
  };
  const stageImpactOptions = {
    // ... (Chart Options remain the same for brevity) ...
  };


  const materialFlowData = {
    labels: material_flow.labels,
    datasets: [{
      data: material_flow.data,
      backgroundColor: material_flow.backgroundColor,
      hoverOffset: 4,
      borderColor: '#1f2937', // Dark background color for slice borders
      borderWidth: 2,
    }],
  };
  const materialFlowOptions = {
    // ... (Chart Options remain the same for brevity) ...
  };
  
  // --- Download Report Logic (Calls Node API, which calls Python) ---

  // const downloadReport = async () => {
  //   setMessage({ text: 'Generating PDF report...', type: 'info' });
  //   try {
  //     // Data structure matching the Python ReportData Pydantic model
  //     const payload = {
  //       linear: results.linear,
  //       circular: results.circular,
  //       recommendations: results.recommendations,
  //       stage_impact: results.stage_impact,
  //     };
      
  //     await axios.post('/api/report', payload, {
  //       responseType: 'blob' // Expecting binary data (PDF)
  //     });
  //     // ... (File download logic remains the same) ...
      
  //     setMessage({ text: 'Report downloaded successfully!', type: 'success' });
  //   } catch (error) {
  //     console.error('Report download failed:', error.response ? error.response.data : error.message);
  //     setMessage({ text: 'Failed to download report. Check backend/Python logs.', type: 'error' });
  //   }
  // };
    const downloadReport = async () => {
    setMessage({ text: 'Generating PDF report...', type: 'info' });
    try {
      // Data structure matching the Python ReportData Pydantic model
      const payload = {
        linear: linear,
        circular: circular,
        recommendations: recommendations,
        stage_impact: stage_impact,
      };
      
      const response = await axios.post('/api/report', payload, {
        responseType: 'blob' // Expecting binary data (PDF)
      });

      // --- CRITICAL FIX: Ensure the download link is created and clicked ---
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      // Use header data if available, otherwise default filename
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : 'lca_report.pdf';
          
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // We set a success message only after the download process is initiated
      setMessage({ text: 'Report generation successful. Check your downloads folder.', type: 'success' });
    } catch (error) {
      console.error('Report download failed:', error.response ? error.response.data : error.message);
      setMessage({ text: 'Failed to download report. Check Python server console. (Connection failed)', type: 'error' });
    }
  };

  // --- JSX Render ---

  const co2Reduction = ((1 - (circular.co2_total / linear.co2_total)) * 100).toFixed(1);
  const costSavings = (linear.cost_total - circular.cost_total).toFixed(2); 

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">
          Simulation Results Dashboard
        </h1>
        <MessageBanner message={message.text} type={message.type} />
        
        {/* Executive Summary Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <StatCard
            title="CO₂ Reduction"
            value={`${co2Reduction}%`}
            color="text-green-400"
          />
          <StatCard
            title="Cost Savings"
            value={`$${costSavings}`}
            color="text-teal-400"
          />
          <StatCard
            title="Circularity Score (MCI)"
            value={circular.Circularity.toFixed(2)}
            color="text-sky-400"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Total Impact Comparison (CO₂ & Cost)">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-center font-semibold mb-2 text-lg">Total CO₂</h3>
                <Pie data={co2Data} />
              </div>
              <div className="h-full">
                <h3 className="text-center font-semibold mb-2 text-lg">Total Cost</h3>
                <Pie data={costData} />
              </div>
            </div>
          </ChartCard>
          <ChartCard title="Stage-wise Impact Comparison">
            <Bar data={stageImpactData} />
          </ChartCard>
          <ChartCard title="Material Flow (Input Mix)">
            <Pie data={materialFlowData} />
          </ChartCard>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">AI-Driven Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} title={rec.title} text={rec.text} />
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-lg font-semibold rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-300"
          >
            Run Another Simulation
          </button>
          <button
            onClick={downloadReport}
            className="px-6 py-3 text-lg font-semibold rounded-full bg-teal-500 hover:bg-teal-600 transition-colors duration-300"
          >
            Download Report (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  color
}) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-emerald-400">
    <h3 className="text-gray-400 text-lg font-medium">{title}</h3>
    <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const ChartCard = ({
  title,
  children
}) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
    <h2 className="text-2xl font-semibold mb-4 text-emerald-400">{title}</h2>
    {children}
  </div>
);

const RecommendationCard = ({
  title,
  text
}) => (
  <div className="bg-gray-700 p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-sky-400 mb-1">{title}</h3>
    <p className="text-gray-300">{text}</p>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [simulationResults, setSimulationResults] = useState(null);
  const [companyDefaults, setCompanyDefaults] = useState({});
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);

  // Fetch company defaults on component mount
  useEffect(() => {
    const fetchDefaults = async () => {
        try {
            const response = await axios.get(`/api/defaults/${COMPANY_ID}`);
            // If response is not empty, use it. Otherwise, defaults remain {} (system default)
            if (Object.keys(response.data).length > 0) {
                setCompanyDefaults(response.data);
            }
        } catch (error) {
            // Note: If MongoDB is down, this error is expected. We proceed anyway.
            console.error('Failed to fetch company defaults:', error);
        } finally {
            setDefaultsLoaded(true);
        }
    };
    fetchDefaults();
  }, []); 
  
  const handleStart = () => {
    setCurrentPage('form');
  };

  const handleSimulate = (results) => {
    setSimulationResults(results);
    setCurrentPage('dashboard');
  };

  const handleBack = () => {
    setCurrentPage('form');
    setSimulationResults(null);
  };

  // --- Render Logic with Loading Fallback ---
  let content;

  if (!defaultsLoaded) {
      // Show a simple loading state while waiting for the initial DB check
      content = (
          <div className="flex justify-center items-center h-screen bg-gray-900 text-teal-400 text-xl">
              Loading Application and Checking Company Defaults...
          </div>
      );
  } else if (currentPage === 'landing') {
      content = <LandingPage onStart={handleStart} />;
  } else if (currentPage === 'form') {
      content = (
        <div className="max-w-7xl mx-auto pt-8">
          {/* Collapsible Panel for Company Parameters */}
          <details className="mb-8 p-0">
            <summary className="cursor-pointer bg-gray-700/50 p-4 rounded-xl text-lg font-semibold text-sky-400 hover:bg-gray-700 transition">
              ⚙️ Optional: Configure Company AI Parameters
            </summary>
            <div className="mt-4">
              <CompanyDefaultsForm 
                  onSetDefaults={setCompanyDefaults} 
                  defaults={companyDefaults}
                  isLoaded={defaultsLoaded}
              />
            </div>
          </details>

          <LCAForm 
              onSimulate={handleSimulate}
              companyDefaults={companyDefaults}
          />
        </div>
      );
  } else if (currentPage === 'dashboard' && simulationResults) {
      content = <Dashboard results={simulationResults} onBack={handleBack} />;
  } else {
      // Fallback for an unexpected state
      content = (
          <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400 text-xl">
              Application Error: Invalid Page State.
          </div>
      );
  }

  // The final App return
  return (
    <div className="bg-gray-900 min-h-screen">
      {content}
    </div>
  );
}

export default App;
