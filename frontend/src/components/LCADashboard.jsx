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

const LandingPage = ({
  onStart
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-4 animate-pulse">
          AI-Powered Circularity LCA Tool
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Advance sustainability in metallurgy and mining with intelligent insights and actionable data.
        </p>
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
        <button
          onClick={onStart}
          className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({
  title,
  description
}) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 transform hover:scale-105 transition-transform duration-300">
    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-500 mb-2">
      {title}
    </h3>
    <p className="text-gray-400">
      {description}
    </p>
  </div>
);


const CompanyDefaultsForm = ({
  onSetDefaults,
  defaults,
  isLoaded
}) => {
  // All custom defaults matching the backend model
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
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
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
    // Mock CSV Upload Logic
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const mockData = [{
          id: 1,
          weight_kg: '0.015',
          recycled_content: '70',
          energy_extraction: '200',
          energy_manufacturing: '5',
          transport_km: '500',
          transport_mode: 'Truck',
          eol_method: 'Recycling',
          recycling_yield: '90',
          co2_extraction: '8',
          co2_manufacturing: '0.3',
          material_cost: '0.02',
          transport_cost: '0.005'
        }, ];
        setTableData(mockData);
        setIsUploading(false);
        setMessage({ text: 'CSV uploaded successfully!', type: 'success' });
      }, 1500);
    }
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
        const newTableData = imputedData.map((imputedRow, index) => {
            const originalRow = tableData[index];
            const newRow = { ...originalRow };
            
            // Overwrite null/empty fields with imputed data
            Object.keys(imputedRow).forEach(key => {
                const originalValue = originalRow[key];
                // Check if the original field was empty/missing, AND the imputed value is not null
                if ((originalValue === '' || originalValue === null || originalValue === undefined) && 
                    (imputedRow[key] !== null && imputedRow[key] !== undefined)) {
                    
                    newRow[key] = imputedRow[key].toString(); 
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
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
                          className={`w-full bg-transparent border-none text-gray-300 focus:outline-none ${!row[field] ? 'placeholder-red-400 border border-red-500 rounded' : ''}`}
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
  const [message, setMessage] = useState({ text: '', type: '' });
  const {
    linear,
    circular,
    material_flow,
    stage_impact,
    recommendations
  } = results;

  // --- Chart Data Definition ---

  const costData = {
    labels: ['Linear', 'Circular'],
    datasets: [{
      data: [linear.cost_total, circular.cost_total],
      backgroundColor: ['#f87171', '#4ade80'],
      borderColor: ['#b91c1c', '#16a34a'],
      borderWidth: 1,
    }, ],
  };

  const co2Data = {
    labels: ['Linear', 'Circular'],
    datasets: [{
      label: 'Total CO2 Emissions (kg)',
      data: [linear.co2_total, circular.co2_total],
      backgroundColor: ['#f87171', '#4ade80'],
      borderColor: ['#b91c1c', '#16a34a'],
      borderWidth: 1,
    }, ],
  };

  const stageImpactData = {
    labels: stage_impact.labels,
    datasets: [{
      label: 'Linear Model Impact',
      data: stage_impact.linear,
      backgroundColor: 'rgba(248, 113, 129, 0.5)',
      borderColor: 'rgba(248, 113, 129, 1)',
      borderWidth: 1,
    }, {
      label: 'Circular Model Impact',
      data: stage_impact.circular,
      backgroundColor: 'rgba(74, 222, 128, 0.5)',
      borderColor: 'rgba(74, 222, 128, 1)',
      borderWidth: 1,
    }, ],
  };

  const materialFlowData = {
    labels: material_flow.labels,
    datasets: [{
      data: material_flow.data,
      backgroundColor: material_flow.backgroundColor,
      hoverOffset: 4,
    }, ],
  };
  
  // --- Download Report Logic (Calls Node API, which calls Python) ---

  const downloadReport = async () => {
    setMessage({ text: 'Generating PDF report...', type: 'info' });
    try {
      // Data structure matching the Python ReportData Pydantic model
      const payload = {
        linear: results.linear,
        circular: results.circular,
        recommendations: results.recommendations,
        stage_impact: results.stage_impact,
      };
      
      const response = await axios.post('/api/report', payload, {
        responseType: 'blob' // Expecting binary data (PDF)
      });

      // Trigger the file download (standard browser trick)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lca_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage({ text: 'Report downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Report download failed:', error.response ? error.response.data : error.message);
      setMessage({ text: 'Failed to download report. Check backend/Python logs.', type: 'error' });
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
              <div>
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

  return (
    <div className="bg-gray-900 min-h-screen">
      {currentPage === 'landing' && <LandingPage onStart={handleStart} />}
      {currentPage === 'form' && (
        <div className="max-w-7xl mx-auto pt-8">
            <CompanyDefaultsForm 
                onSetDefaults={setCompanyDefaults} 
                defaults={companyDefaults}
                isLoaded={defaultsLoaded}
            />
            <LCAForm 
                onSimulate={handleSimulate}
                companyDefaults={companyDefaults}
            />
        </div>
      )}
      {currentPage === 'dashboard' && simulationResults && <Dashboard results={simulationResults} onBack={handleBack} />}
    </div>
  );
  }

export default App;
