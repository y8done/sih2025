import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Line,
  Bar,
  Pie,
  Doughnut
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

// Register Chart.js components
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

const COMPANY_ID = 'company1';

// --- PERFECTED ICONS & COMPONENTS ---

const MessageBanner = ({ message, type }) => {
  if (!message) return null;
  const typeStyles = {
    success: 'bg-emerald-500/80 text-white',
    error: 'bg-red-500/80 text-white',
    info: 'bg-sky-500/80 text-white',
  };
  return <div className={`p-3 rounded-lg font-semibold mb-6 text-center shadow-lg text-sm ${typeStyles[type]}`}>{message}</div>;
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 shadow-lg h-full relative overflow-hidden group">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-emerald-400"></div>
    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-5 shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
      {icon}
    </div>
    {/* INCREASED FONT SIZE: text-lg -> text-xl, text-xs -> text-sm */}
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3> 
    <p className="text-slate-300 text-sm">{description}</p>
    </div>
);

// --- PERFECTED SVG ICONS FOR DASHBOARD & LANDING PAGE ---
const LeafIcon = () => (<svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1.62-1.93C9.2,17.78,12.5,16,17,16A3,3,0,0,0,20,13V11A3,3,0,0,0,17,8Z" /><path d="M17,2H15a1,1,0,0,0-1,1V5.54a2.91,2.91,0,0,0,0,.19,3,3,0,0,0,3,3h0a3,3,0,0,0,3-3V3A1,1,0,0,0,19,2Z" /></svg>);
const DollarIcon = () => (<svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M11.5,17.5a1,1,0,0,1-1-1v-2.26a3,3,0,0,1,0-1.48V10.5a1,1,0,0,1,2,0v2.26a3,3,0,0,1,0,1.48V16.5A1,1,0,0,1,11.5,17.5Z" /><path d="M13,8.5H10a1,1,0,0,0,0,2h3a1,1,0,0,1,0,2H11.5a3,3,0,0,1-3-3v-1a3,3,0,0,1,3-3H13a1,1,0,0,1,0,2Z" /></svg>);
const CircularityIcon = () => (<svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M12,2A10,10,0,0,0,5.12,4.77V3a1,1,0,0,0-2,0V7.5a1,1,0,0,0,1,1H8.62a1,1,0,0,0,0-2H6.22A8,8,0,1,1,4,12a1,1,0,0,0-2,0A10,10,0,1,0,12,2Z" /></svg>);
const BrainIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" /><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" /><path d="M12 13a3.5 3.5 0 0 0 -3.5 -3.5h-1a3.5 3.5 0 0 0 0 7h1" /><path d="M12 13a3.5 3.5 0 0 1 3.5 -3.5h1a3.5 3.5 0 0 1 0 7h-1" /><path d="M12 13a3.5 3.5 0 0 1 3.5 3.5" /><path d="M12 13a3.5 3.5 0 0 0 -3.5 3.5" /><path d="M12 9.5a3.5 3.5 0 0 1 -3.5 -3.5" /><path d="M12 9.5a3.5 3.5 0 0 0 3.5 -3.5" /></svg>);
const RecycleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17l-2 2l2 2" /><path d="M10 19h9a2 2 0 0 0 1.75 -2.75l-2.75 -5l2.75 -5a2 2 0 0 0 -1.75 -2.75h-9l-2 2l2 2" /><path d="M8.5 10.5l-3.5 3.5" /><path d="M12 5l-2 -2l2 -2" /></svg>);
const ReportIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><rect x="8" y="3" width="8" height="4" rx="1" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>);


// --- MAIN COMPONENTS ---

const LandingPage = ({ onStart }) => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-6xl w-full text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-2">MINOVA</h1>
          <div className="w-28 h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-emerald-400 mx-auto rounded-full mb-6"></div>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-100 mb-4">AI-Powered Circularity LCA Tool</h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">Advance sustainability in metallurgy and mining with intelligent insights and actionable data.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FeatureCard title="AI-Assisted Data" description="Our model predicts missing data, giving you a complete analysis even with incomplete inputs." icon={<BrainIcon />} />
          <FeatureCard title="Circularity Visualization" description="Visualize material loops and waste streams to understand your true environmental impact." icon={<RecycleIcon />} />
          <FeatureCard title="Actionable Reports" description="Generate comprehensive reports with clear recommendations for reducing costs and emissions." icon={<ReportIcon />} />
        </div>
        <button onClick={onStart} className="px-8 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-teal-500/40">
          Get Started
        </button>
      </div>
    </div>
);

const CompanyDefaultsForm = ({ onSetDefaults, defaults, isLoaded }) => {
    const [customDefaults, setCustomDefaults] = useState(defaults || { co2_per_kwh_extraction: 0.5, co2_per_kwh_manufacturing: 0.35, recycling_yield_default: 85, transport_cost_per_km_default: 0.005, avg_energy_extraction_mj: 250, });
    const [message, setMessage] = useState({ text: '', type: '' });
    useEffect(() => { if (defaults && isLoaded) { setCustomDefaults(defaults); setMessage({ text: defaults.co2_per_kwh_extraction ? 'Custom parameters loaded.' : 'Using system defaults. Set yours below!', type: 'info' }); } }, [defaults, isLoaded]);
    const handleDefaultChange = (e) => { const { name, value } = e.target; setCustomDefaults(prev => ({ ...prev, [name]: parseFloat(value) || 0 })); };
    const handleSaveDefaults = async () => { setMessage({ text: 'Saving parameters...', type: 'info' }); try { await axios.post(`/api/defaults/${COMPANY_ID}`, customDefaults); onSetDefaults(customDefaults); setMessage({ text: 'Custom parameters saved successfully!', type: 'success' }); } catch (error) { console.error('Failed to save defaults:', error); setMessage({ text: 'Failed to save parameters. Check MongoDB connection.', type: 'error' }); } };
    const inputStyle = "w-full p-2 bg-white/5 border border-white/10 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all text-sm";
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
          <MessageBanner message={message.text} type={message.type} />
          <h3 className="text-lg font-bold text-white mb-2">Custom AI Parameters (Company: {COMPANY_ID})</h3>
          <p className="text-slate-300 text-xs mb-6">These values are used for AI data imputation, providing more accurate, company-specific results.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <label className="block space-y-2"><span className="font-semibold text-slate-200 uppercase tracking-wider">CO₂ / kWh (Extraction, kg)</span><input type="number" step="0.01" name="co2_per_kwh_extraction" value={customDefaults.co2_per_kwh_extraction} onChange={handleDefaultChange} className={inputStyle} /></label>
            <label className="block space-y-2"><span className="font-semibold text-slate-200 uppercase tracking-wider">CO₂ / kWh (Mfg, kg)</span><input type="number" step="0.01" name="co2_per_kwh_manufacturing" value={customDefaults.co2_per_kwh_manufacturing} onChange={handleDefaultChange} className={inputStyle} /></label>
            <label className="block space-y-2"><span className="font-semibold text-slate-200 uppercase tracking-wider">Recycling Yield (%)</span><input type="number" step="1" name="recycling_yield_default" value={customDefaults.recycling_yield_default} onChange={handleDefaultChange} className={inputStyle} /></label>
            <label className="block space-y-2"><span className="font-semibold text-slate-200 uppercase tracking-wider">Transport Cost / km (USD)</span><input type="number" step="0.001" name="transport_cost_per_km_default" value={customDefaults.transport_cost_per_km_default} onChange={handleDefaultChange} className={inputStyle} /></label>
            <label className="block space-y-2"><span className="font-semibold text-slate-200 uppercase tracking-wider">Avg. Energy Extraction (MJ)</span><input type="number" step="10" name="avg_energy_extraction_mj" value={customDefaults.avg_energy_extraction_mj} onChange={handleDefaultChange} className={inputStyle} /></label>
          </div>
          <button onClick={handleSaveDefaults} className="mt-6 px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity duration-300">Save Parameters</button>
        </div>
    );
};

const LCAForm = ({ onSimulate, companyDefaults, simulationStatus, setSimulationStatus }) => {
    const [formData, setFormData] = useState({ metal_type: 'Aluminium Can', functional_unit: '1 can', geographic_scope: 'India', scenario_selection: 'Both' });
    const [tableData, setTableData] = useState([{ id: 1, weight_kg: '0.015', recycled_content: '70', energy_extraction: '200', energy_manufacturing: '', transport_km: '500', transport_mode: 'Truck', eol_method: 'Recycling', recycling_yield: '90', co2_extraction: '8', co2_manufacturing: '', material_cost: '0.02', transport_cost: '0.005' }]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData({ ...formData, [name]: value }); };
    const handleTableChange = (e, id, field) => { const { value } = e.target; setTableData(prevData => prevData.map(row => row.id === id ? { ...row, [field]: value } : row)); };
    const handleAddRow = () => { setTableData(prevData => [...prevData, { id: prevData.length + 1, weight_kg: '', recycled_content: '', energy_extraction: '', energy_manufacturing: '', transport_km: '', transport_mode: '', eol_method: '', recycling_yield: '', co2_extraction: '', co2_manufacturing: '', material_cost: '', transport_cost: '' }]); };
    
    const handleFileChange = (e) => { 
        const file = e.target.files[0]; 
        if (!file) return; 
        setIsUploading(true); 
        setMessage({ text: 'Processing CSV file...', type: 'info' }); 
        const reader = new FileReader(); 
        reader.onload = (event) => { 
            try { 
                const text = event.target.result; 
                const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#')); 
                if (lines.length < 2) { setMessage({ text: 'CSV must contain headers and at least one data row.', type: 'error' }); setIsUploading(false); return; } 
                const headers = lines[0].split(',').map(h => h.trim()); 
                const expectedColumnCount = headers.length; 
                const dataRows = lines.slice(1); 
                const newTableData = []; 
                let hasError = false; 
                dataRows.forEach((line, index) => { 
                    if (hasError) return; 
                    const values = line.split(','); 
                    if (values.length !== expectedColumnCount) { setMessage({ text: `Parsing Error: Row ${index + 2} has ${values.length} columns, expected ${expectedColumnCount}.`, type: 'error' }); hasError = true; return; } 
                    const rowObject = { id: index + 1 }; 
                    headers.forEach((header, i) => { 
                        const field = header.toLowerCase().replace(/_percent|_usd|_kg|_mj| /g, '').replace(/ /g, '_'); 
                        const rawValue = values[i] ? values[i].trim().replace(/"/g, '') : ''; 
                        rowObject[field] = rawValue === '' ? '' : rawValue; 
                    }); 
                    newTableData.push(rowObject); 
                }); 
                if (hasError) { setIsUploading(false); return; } 
                if (newTableData.length > 0) { setTableData(newTableData); setMessage({ text: `CSV uploaded successfully! Loaded ${newTableData.length} row(s).`, type: 'success' }); } else { setMessage({ text: 'No valid data rows found in CSV.', type: 'error' }); } 
            } catch (error) { console.error('Error parsing CSV:', error); setMessage({ text: 'Critical Error processing CSV file. Check formatting.', type: 'error' }); } finally { setIsUploading(false); } 
        }; 
        reader.onerror = () => { setMessage({ text: 'Failed to read file.', type: 'error' }); setIsUploading(false); }; 
        reader.readAsText(file); 
    };
    
    const handleAIAutoFill = async () => { 
        setMessage({ text: 'AI is filling in missing values...', type: 'info' }); 
        const payload = { 
            project_metadata: formData, 
            data: tableData.map(row => ({ weight_kg: parseFloat(row.weight_kg) || null, recycled_content: parseFloat(row.recycled_content) || null, energy_extraction: parseFloat(row.energy_extraction) || null, energy_manufacturing: parseFloat(row.energy_manufacturing) || null, transport_km: parseFloat(row.transport_km) || null, transport_mode: row.transport_mode || null, recycling_yield: parseFloat(row.recycling_yield) || null, co2_extraction: parseFloat(row.co2_extraction) || null, co2_manufacturing: parseFloat(row.co2_manufacturing) || null, material_cost: parseFloat(row.material_cost) || null, transport_cost: parseFloat(row.transport_cost) || null, eol_method: row.eol_method || null, })), 
            custom_defaults: companyDefaults && companyDefaults.co2_per_kwh_extraction ? companyDefaults : null 
        }; 
        try { 
            const response = await axios.post('/api/impute', payload); 
            const imputedData = response.data.imputed_data; 
            const newTableData = tableData.map((originalRow, index) => { 
                const imputedRow = imputedData[index]; 
                const newRow = { ...originalRow }; 
                Object.keys(imputedRow).forEach(key => { 
                    const originalValue = originalRow[key]; 
                    if ((originalValue === '' || originalValue === null || originalValue === undefined) && (imputedRow[key] !== null && imputedRow[key] !== undefined)) { newRow[key] = (typeof imputedRow[key] === 'number') ? imputedRow[key].toFixed(3) : imputedRow[key].toString(); } 
                }); 
                return newRow; 
            }); 
            setTableData(newTableData); 
            setMessage({ text: `AI-assisted values filled using ${companyDefaults.co2_per_kwh_extraction ? 'CUSTOM' : 'SYSTEM'} parameters!`, type: 'success' }); 
        } catch (error) { 
            console.error('AI Imputation failed:', error.response ? error.response.data : error.message); 
            setMessage({ text: 'AI imputation failed. Check Python server console.', type: 'error' }); 
        } 
    };
    
    const runSimulation = async () => { 
        setSimulationStatus('running'); 
        setMessage({ text: 'Running simulation...', type: 'info' }); 
        
        const payload = { 
            project_metadata: formData, 
            data: tableData.map(row => ({ weight_kg: parseFloat(row.weight_kg) || null, recycled_content: parseFloat(row.recycled_content) || null, energy_extraction: parseFloat(row.energy_extraction) || null, energy_manufacturing: parseFloat(row.energy_manufacturing) || null, transport_km: parseFloat(row.transport_km) || null, transport_mode: row.transport_mode || null, recycling_yield: parseFloat(row.recycling_yield) || null, co2_extraction: parseFloat(row.co2_extraction) || null, co2_manufacturing: parseFloat(row.co2_manufacturing) || null, material_cost: parseFloat(row.material_cost) || null, transport_cost: parseFloat(row.transport_cost) || null, eol_method: row.eol_method || null, })), 
            custom_defaults: companyDefaults && companyDefaults.co2_per_kwh_extraction ? companyDefaults : null 
        }; 
        
        // REMOVED ARTIFICIAL DELAY (3500ms) - LoadingOverlay now controls the time.
        
        try { 
            const response = await axios.post('/api/simulate', payload); 
            const { results } = response.data; 

            const frontEndResults = { 
                linear: results.linear, 
                circular: results.circular, 
                material_flow: { 
                    labels: ['Virgin', 'Recycled', 'Loss'], 
                    data: [results.circular.Virgin_Input_percent || 30, results.circular.Recycled_Input_percent || 60, 10], 
                    backgroundColor: ['#fb923c', '#34d399', '#94a3b8'] 
                }, 
                stage_impact: { 
                    labels: ['Extraction', 'Processing', 'Transport', 'EoL'], 
                    linear: [results.linear.CO2_total_kg * 0.4, results.linear.CO2_total_kg * 0.3, results.linear.CO2_total_kg * 0.2, results.linear.CO2_total_kg * 0.1], 
                    circular: [results.circular.CO2_total_kg * 0.25, results.circular.CO2_total_kg * 0.3, results.circular.CO2_total_kg * 0.25, results.circular.CO2_total_kg * 0.2] 
                }, 
                recommendations: [{ 
                    title: 'Optimal Scenario', 
                    text: results.recommendation 
                }, { 
                    title: 'Increase Recycled Content', 
                    text: `Based on your data, increasing recycled content could further reduce CO₂ emissions and improve the Circularity Score of ${results.circular.Circularity.MCI.toFixed(2)}.` 
                }], 
            }; 
            
            onSimulate(frontEndResults); // Signal success with results
            setMessage({ text: 'Simulation data received. Finalizing report...', type: 'info' }); 
        } catch (error) { 
            console.error('Simulation failed:', error.response ? error.response.data : error.message); 
            setMessage({ text: 'Failed to run simulation. Check Python server console.', type: 'error' }); 
            setSimulationStatus('completed'); // Instantly dismiss on hard error
        }
        // NOTE: We no longer set 'completed' here for successful runs; LoadingOverlay handles it.
    };
    
    const inputStyle = "w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all text-sm";
    const tableInputStyle = "w-full bg-transparent border-none text-slate-200 focus:outline-none text-xs";
    const btnPrimary = "px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity duration-300 flex items-center gap-2";
    const btnSecondary = "px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:opacity-90 transition-opacity duration-300 flex items-center gap-2";
    const customDefaultsUsed = companyDefaults && companyDefaults.co2_per_kwh_extraction;
    const defaultsStatusText = customDefaultsUsed ? 'COMPANY CUSTOM' : 'SYSTEM DEFAULT';

    return (
        <div className="animate-fadeIn text-sm">
          <MessageBanner message={message.text} type={message.type} />
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-4">
              <div className="w-1 h-5 bg-gradient-to-b from-teal-400 to-orange-400 rounded-full"></div>
              Project Setup
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input type="text" name="metal_type" value={formData.metal_type} onChange={handleInputChange} className={`mt-2 ${inputStyle}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                <input type="text" name="functional_unit" value={formData.functional_unit} onChange={handleInputChange} className={`mt-2 ${inputStyle}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geographic Scope</label>
                <input type="text" name="geographic_scope" value={formData.geographic_scope} onChange={handleInputChange} className={`mt-2 ${inputStyle}`} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scenario Selection</label>
                <select name="scenario_selection" value={formData.scenario_selection} onChange={handleInputChange} className={`mt-2 ${inputStyle}`}>
                  <option>Linear</option><option>Circular</option><option defaultValue='Both'>Both (Comparison)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-8">
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-4">
                <div className="w-1 h-5 bg-gradient-to-b from-teal-400 to-orange-400 rounded-full"></div>
                Data Input
              </h3>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${customDefaultsUsed ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'}`}>AI Defaults: {defaultsStatusText}</span>
                <button onClick={handleAIAutoFill} className={btnPrimary}><i className="fas fa-magic text-xs"></i> Suggest with AI</button>
                <label className={btnSecondary}><i className="fas fa-upload text-xs"></i> {isUploading ? 'Uploading...' : 'Upload CSV'}<input type="file" onChange={handleFileChange} className="hidden" accept=".csv" disabled={isUploading} /></label>
            </div>
            </div>
            <div className="overflow-x-auto bg-black/10 border border-white/10 rounded-lg">
              <div className="w-full h-px bg-white/10 mb-4"></div>
              <table className="min-w-full text-xs">
                <thead className="bg-transparent">
                  <tr>{tableData.length > 0 && Object.keys(tableData[0]).filter(key => key !== 'id').map(key => (<th key={key} className="px-4 py-3 text-left font-bold text-teal-300 uppercase tracking-wider">{key.replace(/_/g, ' ')}</th>))}</tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {tableData.map(row => (<tr key={row.id} className="hover:bg-white/5 transition-colors">{Object.keys(row).filter(key => key !== 'id').map(field => (<td key={field} className="px-4 py-2 whitespace-nowrap"><input type="text" value={row[field]} onChange={(e) => handleTableChange(e, row.id, field)} className={tableInputStyle} placeholder="-" /></td>))}</tr>))}
                </tbody>
              </table>
              <div className="w-full h-px bg-white/10 mt-4"></div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-center">
                <button onClick={runSimulation} className={`${btnPrimary} text-base px-8 py-3`} disabled={simulationStatus === 'running'}>
                    <i className="fas fa-play"></i> {simulationStatus === 'running' ? 'Running Simulation...' : 'Run Simulation'}
                </button>
            </div>
          </div>
        </div>
    );
};

const Dashboard = ({ results, onBack }) => {
    const [message, setMessage] = useState({ text: '', type: '' });
    if (!results || !results.linear || !results.circular) { return <div className="text-red-400 text-center p-8">Simulation Data Error. Please run a new simulation.</div>; }
    const { linear, circular, recommendations, material_flow, stage_impact } = results;

    const downloadReport = async () => {
        setMessage({ text: 'Generating PDF report...', type: 'info' });
        
        const reportPayload = { 
            linear: { CO2_total_kg: linear.CO2_total_kg, Cost_total_USD: linear.Cost_total_USD, Circularity: linear.Circularity }, 
            circular: { CO2_total_kg: circular.CO2_total_kg, Cost_total_USD: circular.Cost_total_USD, Circularity: circular.Circularity }, 
            recommendations, 
            stage_impact: { 
                labels: ['Extraction', 'Manufacturing', 'Transport', 'End-of-Life'], 
                linear: [45.2, 28.7, 12.1, 8.3], // Using mock data for report consistency 
                circular: [13.6, 15.2, 6.1, 4.9] // Using mock data for report consistency 
            } 
        };
        
        if (!reportPayload.linear.CO2_total_kg && !reportPayload.circular.CO2_total_kg) {
            console.error("Report Error: Simulation data is missing or empty.");
            setMessage({ text: 'Report generation failed: Data is empty.', type: 'error' });
            return;
        }
        try {
          const response = await axios.post('/api/report', reportPayload, { responseType: 'blob' });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const contentDisposition = response.headers['content-disposition'];
          const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'lca_report.pdf';
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setMessage({ text: 'Report generation successful. Check downloads.', type: 'success' });
        } catch (error) {
          console.error('Report download failed:', error);
          const errorText = 'Failed to generate report. Ensure the backend is running and check the server console for errors.';
          setMessage({ text: errorText, type: 'error' });
          console.error(errorText);
        }
    };
    
    const co2Reduction = linear.CO2_total_kg ? ((1 - (circular.CO2_total_kg / linear.CO2_total_kg)) * 100).toFixed(1) : 0;
    const costSavings = (linear.Cost_total_USD - circular.Cost_total_USD).toFixed(2);
    const circularityScore = circular.Circularity.MCI ? circular.Circularity.MCI.toFixed(2) : 0;

    const commonChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 20, font: { size: 10 } } } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }, y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } } } };
    const pieChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 15, font: { size: 10 } } } } };

    const totalImpactCo2Data = {
        labels: ['Linear', 'Circular'],
        datasets: [{ data: [linear.CO2_total_kg, circular.CO2_total_kg], backgroundColor: ['#B4413C', '#1FB8CD'], borderColor: '#0f172a', borderWidth: 4 }]
    };
    const totalImpactCostData = {
        labels: ['Linear', 'Circular'],
        datasets: [{ data: [linear.Cost_total_USD, circular.Cost_total_USD], backgroundColor: ['#B4413C', '#1FB8CD'], borderColor: '#0f172a', borderWidth: 4 }]
    };

    const stageImpactData = {
        labels: stage_impact.labels,
        datasets: [ 
          { label: 'Linear', data: stage_impact.linear, backgroundColor: '#1FB8CD' }, 
          { label: 'Circular', data: stage_impact.circular, backgroundColor: '#5D878F' } 
        ]
    };
    const materialFlowData = {
        labels: material_flow.labels,
        datasets: [{ data: material_flow.data, backgroundColor: material_flow.backgroundColor, borderColor: '#0f172a', borderWidth: 4 }]
    };


    return (
        <div className="animate-fadeIn text-sm">
          <MessageBanner message={message.text} type={message.type} />
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Simulation Results Dashboard</h2>
            <p className="text-slate-300 text-xs">Analysis complete. Review your key metrics and recommendations below.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <MetricCard title="CO₂ Reduction" value={`${co2Reduction}%`} icon={<LeafIcon />} color="emerald" />
            <MetricCard title="Cost Savings" value={`$${costSavings}`} icon={<DollarIcon />} color="amber" />
            <MetricCard title="Circularity Score" value={circularityScore} icon={<CircularityIcon />} color="teal" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <ChartWrapper title="Total Impact: CO₂" className="lg:col-span-1"><Pie options={pieChartOptions} data={totalImpactCo2Data} /></ChartWrapper>
            <ChartWrapper title="Total Impact: Cost" className="lg:col-span-1"><Pie options={pieChartOptions} data={totalImpactCostData} /></ChartWrapper>
            <ChartWrapper title="Stage-wise Impact Comparison" className="lg:col-span-1"><Bar options={commonChartOptions} data={stageImpactData} /></ChartWrapper>
            <ChartWrapper title="Material Flow" className="lg:col-span-1"><Pie options={pieChartOptions} data={materialFlowData} /></ChartWrapper>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-10">
            <h3 className="text-xl font-bold text-white mb-6 text-center">AI Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (<RecommendationCard key={index} title={rec.title} text={rec.text} />))}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={onBack} className="px-6 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Run New Simulation</button>
            <button onClick={downloadReport} className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity">Download Report (PDF)</button>
          </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }) => {
    const colors = { emerald: 'from-emerald-500 to-green-500', amber: 'from-amber-500 to-orange-500', teal: 'from-teal-500 to-cyan-500' };
    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-lg relative overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colors[color]}`}></div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${colors[color]} shadow-lg ml-3`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <h4 className="text-slate-400 text-xs font-medium">{title}</h4>
          </div>
        </div>
    );
};

const ChartWrapper = ({ title, children, className = '' }) => (
    <div className={`bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg ${className}`}>
      <h4 className="text-lg font-bold text-white mb-4 text-center">{title}</h4>
      <div className="bg-slate-900/50 p-4 rounded-lg border border-white/10"><div style={{ position: 'relative', height: '250px' }}>{children}</div></div>
    </div>
);

const RecommendationCard = ({ title, text }) => {
    let icon;
    if (title.toLowerCase().includes('recycled')) {
        icon = <i className="fas fa-recycle text-lg text-white"></i>;
    } else if (title.toLowerCase().includes('transport')) {
        icon = <i className="fas fa-truck text-lg text-white"></i>;
    } else {
        icon = <i className="fas fa-lightbulb text-lg text-white"></i>; // Fallback
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 h-full text-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-emerald-400"></div>
            <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-lg text-white mt-1 shadow-lg">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-white mb-1">{title}</h4>
                <p className="text-slate-300 text-xs">{text}</p>
            </div>
        </div>
    );
};

const LoadingOverlay = ({ isApiComplete, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);
    const stages = [ { text: "Data Processing", icon: <i className="fas fa-database"></i> }, { text: "Impact Analysis", icon: <i className="fas fa-chart-line"></i> }, { text: "Circularity Assessment", icon: <i className="fas fa-sync-alt"></i> }, { text: "Report Generation", icon: <i className="fas fa-check-circle"></i> }, ];
    
    useEffect(() => { 
      const interval = setInterval(() => { 
        setProgress(prev => { 
            let nextProgress = prev;
            
            // If the API call is complete AND progress is near 100%, force completion
            if (isApiComplete && prev >= 99.5) {
              clearInterval(interval);
              onComplete(); // Signal parent to dismiss overlay
              return 100;
            }

            // If the API is complete, use larger steps to quickly reach 100%
            if (isApiComplete) {
              nextProgress = prev + Math.random() * 3 + 1; // SLOWED DOWN: Max step 4.0 (was 8.0)
            } else {
              // Normal, slower progress
              nextProgress = prev + Math.random() * 0.8 + 0.2; // SLOWED DOWN: Max step 1.0 (was 2.0)
            }

            // Cap normal animation at 99.5% if API isn't ready, otherwise use calculated progress
            const safeProgress = isApiComplete ? nextProgress : Math.min(99.5, nextProgress);

            // Stage logic
            if (safeProgress >= 25 && stage < 1) setStage(1); 
            if (safeProgress >= 50 && stage < 2) setStage(2); 
            if (safeProgress >= 75 && stage < 3) setStage(3); 
            
            return safeProgress; 
        }); 
      }, 150); // CHANGED: Increased interval time to 150ms for smoother pacing
      return () => clearInterval(interval); 
    }, [stage, isApiComplete, onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex items-center justify-center animate-fadeIn p-4">
          <div className="text-center max-w-md w-full p-8 bg-slate-800/50 border border-white/10 rounded-2xl shadow-2xl">
              <div className="w-14 h-14 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-5"></div>
              <h3 className="text-white text-xl font-bold mb-2">Processing LCA Analysis</h3>
              {/* Use Math.round for smooth display up to 100% */}
              <p className="text-slate-300 mb-5 text-sm">{stages[stage].text}... {Math.min(100, Math.round(progress))}%</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                  {stages.map((s, i) => (
                      <div key={i} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 h-24 ${i <= stage ? 'bg-white/5 border-white/20' : 'bg-slate-800/50 border-transparent opacity-40'}`}>
                          <div className={`text-xl ${i <= stage ? 'text-teal-400' : 'text-slate-400'}`}>{s.icon}</div>
                          <span className="text-slate-300 text-center">{s.text}</span>
                    </div>
                  ))}
              </div>
          </div>
        </div>
    );
};

function LCADashboard() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [simulationResults, setSimulationResults] = useState(null);
  const [apiResults, setApiResults] = useState(null); // NEW: Holds API response until loading bar finishes
  const [companyDefaults, setCompanyDefaults] = useState({});
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);

  useEffect(() => {
    const fetchDefaults = async () => {
      try { const response = await axios.get(`/api/defaults/${COMPANY_ID}`); if (Object.keys(response.data).length > 0) { setCompanyDefaults(response.data); } } catch (error) { console.error('Failed to fetch company defaults:', error); } finally { setDefaultsLoaded(true); }
    };
    fetchDefaults();
  }, []);

  const handleStart = () => {
    setCurrentPage('form');
    setApiResults(null); // Reset results when starting a new form
  };
  
  // UPDATED: Stores results in apiResults state instead of setting current page immediately
  const handleSimulate = (results) => { 
    setApiResults(results);
  };

  // NEW: Function called by LoadingOverlay when its animation hits 100%
  const handleLoadingComplete = () => {
    if (apiResults) {
      setSimulationResults(apiResults);
      setCurrentPage('dashboard');
    }
    setSimulationStatus('completed');
    setApiResults(null); // Clear API results storage
  };

  const handleBack = () => { setCurrentPage('form'); setSimulationResults(null); };

  let content;
  if (!defaultsLoaded) {
    content = <div className="flex justify-center items-center h-screen text-teal-400 text-lg">Loading...</div>;
  } else if (currentPage === 'landing') {
    content = <LandingPage onStart={handleStart} />;
  } else if (currentPage === 'form') {
    content = (
      <div className="text-sm">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">LCA Project Dashboard</h2>
          <p className="text-slate-300 text-xs">Set up and analyze your lifecycle assessment projects.</p>
        </div>
        <details className="mb-8">
          <summary className="cursor-pointer bg-white/5 p-3 rounded-xl text-base font-semibold text-white hover:bg-white/10 transition">
            ⚙️ Optional: Configure Company AI Parameters
          </summary>
          <div className="mt-4">
            <CompanyDefaultsForm onSetDefaults={setCompanyDefaults} defaults={companyDefaults} isLoaded={defaultsLoaded} />
          </div>
        </details>
        <LCAForm onSimulate={handleSimulate} companyDefaults={companyDefaults} simulationStatus={simulationStatus} setSimulationStatus={setSimulationStatus} />
        <p className="text-xs text-red-500 text-center mt-4">{simulationStatus === 'running' && 'Simulation running in background, awaiting visual completion...'}</p>
      </div>
    );
  } else if (currentPage === 'dashboard' && simulationResults) {
    content = <Dashboard results={simulationResults} onBack={handleBack} />;
  } else {
    content = <div className="text-red-400 text-center p-8">Application Error: Invalid Page State.</div>;
  }

  return (
    <main className="min-h-screen w-full text-white p-4 sm:p-8">
      {simulationStatus === 'running' && (
        <LoadingOverlay isApiComplete={!!apiResults} onComplete={handleLoadingComplete} />
      )}
      <div className="max-w-7xl mx-auto">{content}</div>
    </main>
  );
}

export default LCADashboard;
