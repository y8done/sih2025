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

const MessageBanner = ({ message, type }) => {
  if (!message) return null;
  const typeStyles = {
    success: 'bg-emerald-500/80 text-white',
    error: 'bg-red-500/80 text-white',
    info: 'bg-sky-500/80 text-white',
  };
  return <div className={`p-4 rounded-lg font-semibold mb-6 text-center shadow-lg ${typeStyles[type]}`}>{message}</div>;
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 transform transition-all duration-300 hover:scale-105 hover:bg-white/10 shadow-lg h-full relative overflow-hidden group">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-emerald-400"></div>
    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mb-5 shadow-teal-500/30 shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </div>
);

const LandingPage = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-6xl w-full text-center">
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-2">MINOVA</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-teal-400 via-orange-400 to-emerald-400 mx-auto rounded-full mb-8"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4">AI-Powered Circularity LCA Tool</h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">Advance sustainability in metallurgy and mining with intelligent insights and actionable data.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FeatureCard title="AI-Assisted Data" description="Our model predicts missing data, giving you a complete analysis even with incomplete inputs." icon={<i className="fas fa-brain text-2xl text-white"></i>} />
          <FeatureCard title="Circularity Visualization" description="Visualize material loops and waste streams to understand your true environmental impact." icon={<i className="fas fa-recycle text-2xl text-white"></i>} />
          <FeatureCard title="Actionable Reports" description="Generate comprehensive reports with clear recommendations for reducing costs and emissions." icon={<i className="fas fa-chart-line text-2xl text-white"></i>} />
        </div>
        <button onClick={onStart} className="px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-teal-500/40">
          Get Started
        </button>
      </div>
    </div>
  );
};

const CompanyDefaultsForm = ({ onSetDefaults, defaults, isLoaded }) => {
  const [customDefaults, setCustomDefaults] = useState(defaults || {
    co2_per_kwh_extraction: 0.5, co2_per_kwh_manufacturing: 0.35, recycling_yield_default: 85,
    transport_cost_per_km_default: 0.005, avg_energy_extraction_mj: 250,
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
    const { name, value } = e.target;
    setCustomDefaults(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSaveDefaults = async () => {
    setMessage({ text: 'Saving parameters...', type: 'info' });
    try {
      const payload = {
        co2_per_kwh_extraction: customDefaults.co2_per_kwh_extraction,
        co2_per_kwh_manufacturing: customDefaults.co2_per_kwh_manufacturing,
        recycling_yield_default: customDefaults.recycling_yield_default,
        transport_cost_per_km_default: customDefaults.transport_cost_per_km_default,
        avg_energy_extraction_mj: customDefaults.avg_energy_extraction_mj,
      };
      await axios.post(`/api/defaults/${COMPANY_ID}`, payload);
      onSetDefaults(customDefaults);
      setMessage({ text: 'Custom parameters saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save defaults:', error);
      setMessage({ text: 'Failed to save parameters. Check MongoDB connection.', type: 'error' });
    }
  };

  const inputStyle = "w-full p-3 bg-white/5 border border-white/10 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg">
      <MessageBanner message={message.text} type={message.type} />
      <h3 className="text-xl font-bold text-white mb-2">Custom AI Parameters (Company: {COMPANY_ID})</h3>
      <p className="text-slate-300 mb-6">These values are used for AI data imputation, providing more accurate, company-specific results.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">CO₂ / kWh (Extraction, kg)</span><input type="number" step="0.01" name="co2_per_kwh_extraction" value={customDefaults.co2_per_kwh_extraction} onChange={handleDefaultChange} className={inputStyle} /></label>
        <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">CO₂ / kWh (Mfg, kg)</span><input type="number" step="0.01" name="co2_per_kwh_manufacturing" value={customDefaults.co2_per_kwh_manufacturing} onChange={handleDefaultChange} className={inputStyle} /></label>
        <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Recycling Yield (%)</span><input type="number" step="1" name="recycling_yield_default" value={customDefaults.recycling_yield_default} onChange={handleDefaultChange} className={inputStyle} /></label>
        <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Transport Cost / km (USD)</span><input type="number" step="0.001" name="transport_cost_per_km_default" value={customDefaults.transport_cost_per_km_default} onChange={handleDefaultChange} className={inputStyle} /></label>
        <label className="block space-y-2"><span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Avg. Energy Extraction (MJ)</span><input type="number" step="10" name="avg_energy_extraction_mj" value={customDefaults.avg_energy_extraction_mj} onChange={handleDefaultChange} className={inputStyle} /></label>
      </div>
      <button onClick={handleSaveDefaults} className="mt-6 px-6 py-2 text-md font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity duration-300">Save Parameters</button>
    </div>
  );
};

const LCAForm = ({ onSimulate, companyDefaults, simulationStatus, setSimulationStatus }) => {
  const [formData, setFormData] = useState({ metal_type: 'Aluminium Can', functional_unit: '1 can', geographic_scope: 'India', scenario_selection: 'Both' });
  const [tableData, setTableData] = useState([{ id: 1, weight_kg: '0.015', recycled_content: '70', energy_extraction: '200', energy_manufacturing: '', transport_km: '500', transport_mode: 'Truck', eol_method: 'Recycling', recycling_yield: '90', co2_extraction: '8', co2_manufacturing: '', material_cost: '0.02', transport_cost: '0.005' }]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleTableChange = (e, id, field) => {
    const { value } = e.target;
    setTableData(prevData => prevData.map(row => row.id === id ? { ...row, [field]: value } : row));
  };
  const handleAddRow = () => {
    setTableData(prevData => [...prevData, { id: prevData.length + 1, weight_kg: '', recycled_content: '', energy_extraction: '', energy_manufacturing: '', transport_km: '', transport_mode: '', eol_method: '', recycling_yield: '', co2_extraction: '', co2_manufacturing: '', material_cost: '', transport_cost: '' }]);
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
          if (values.length !== expectedColumnCount) {
            setMessage({ text: `Parsing Error: Row ${index + 2} has ${values.length} columns, expected ${expectedColumnCount}.`, type: 'error' });
            hasError = true;
            return;
          }
          const rowObject = { id: index + 1 };
          headers.forEach((header, i) => {
            const field = header.toLowerCase().replace(/_percent|_usd|_kg|_mj| /g, '').replace(/ /g, '_');
            const rawValue = values[i] ? values[i].trim().replace(/"/g, '') : '';
            rowObject[field] = rawValue === '' ? '' : rawValue;
          });
          newTableData.push(rowObject);
        });
        if (hasError) {
          setIsUploading(false);
          return;
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
    const payload = {
      project_metadata: formData,
      data: tableData.map(row => ({
        weight_kg: parseFloat(row.weight_kg) || null, recycled_content: parseFloat(row.recycled_content) || null, energy_extraction: parseFloat(row.energy_extraction) || null, energy_manufacturing: parseFloat(row.energy_manufacturing) || null,
        transport_km: parseFloat(row.transport_km) || null, transport_mode: row.transport_mode || null, recycling_yield: parseFloat(row.recycling_yield) || null, co2_extraction: parseFloat(row.co2_extraction) || null,
        co2_manufacturing: parseFloat(row.co2_manufacturing) || null, material_cost: parseFloat(row.material_cost) || null, transport_cost: parseFloat(row.transport_cost) || null, eol_method: row.eol_method || null,
      })),
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
          if ((originalValue === '' || originalValue === null || originalValue === undefined) && (imputedRow[key] !== null && imputedRow[key] !== undefined)) {
            newRow[key] = (typeof imputedRow[key] === 'number') ? imputedRow[key].toFixed(3) : imputedRow[key].toString();
          }
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

    // ... (payload setup code is the same)
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

    await new Promise(resolve => setTimeout(resolve, 3500));

    try {
        const response = await axios.post('/api/simulate', payload);
        const { results } = response.data;

        // --- FIX STARTS HERE ---
        // Pass the results directly without restructuring them. This preserves the
        // original keys like "CO2_total_kg" and "Cost_total_USD".
        const frontEndResults = {
            linear: results.linear, // Use the object directly
            circular: results.circular, // Use the object directly
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
        // --- FIX ENDS HERE ---

        onSimulate(frontEndResults);
        setMessage({ text: 'Simulation completed successfully!', type: 'success' });
    } catch (error) {
        console.error('Simulation failed:', error.response ? error.response.data : error.message);
        setMessage({ text: 'Failed to run simulation. Check Python server console.', type: 'error' });
    } finally {
        setSimulationStatus('completed');
    }
};

  const inputStyle = "w-full p-3 bg-white/5 border border-white/10 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all";
  const tableInputStyle = "w-full bg-transparent border-none text-slate-200 focus:outline-none";
  const btnPrimary = "px-6 py-2 font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity duration-300 flex items-center gap-2";
  const btnSecondary = "px-6 py-2 font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:opacity-90 transition-opacity duration-300 flex items-center gap-2";
  const customDefaultsUsed = companyDefaults && companyDefaults.co2_per_kwh_extraction;
  const defaultsStatusText = customDefaultsUsed ? 'COMPANY CUSTOM' : 'SYSTEM DEFAULT';

  return (
    <div className="animate-fadeIn">
      <MessageBanner message={message.text} type={message.type} />
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-8">
        <h3 className="text-xl font-bold text-white mb-6">Project Setup</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input type="text" name="metal_type" placeholder="Product Name" value={formData.metal_type} onChange={handleInputChange} className={inputStyle} />
          <input type="text" name="functional_unit" placeholder="Quantity" value={formData.functional_unit} onChange={handleInputChange} className={inputStyle} />
          <input type="text" name="geographic_scope" placeholder="Geographic Scope" value={formData.geographic_scope} onChange={handleInputChange} className={inputStyle} />
          <select name="scenario_selection" value={formData.scenario_selection} onChange={handleInputChange} className={inputStyle}>
            <option value="Linear">Linear</option><option value="Circular">Circular</option><option value="Both">Both (Comparison)</option>
          </select>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6 pb-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Data Input</h3>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${customDefaultsUsed ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'}`}>AI Defaults: {defaultsStatusText}</span>
            <button onClick={handleAIAutoFill} className={btnPrimary}><i className="fas fa-magic"></i> Suggest with AI</button>
            <label className={btnSecondary}><i className="fas fa-upload"></i> {isUploading ? 'Uploading...' : 'Upload CSV'}<input type="file" onChange={handleFileChange} className="hidden" accept=".csv" disabled={isUploading} /></label>
          </div>
        </div>
        <div className="overflow-x-auto bg-black/10 border border-white/10 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>{tableData.length > 0 && Object.keys(tableData[0]).filter(key => key !== 'id').map(key => (<th key={key} className="px-4 py-3 text-left text-xs font-bold text-teal-300 uppercase tracking-wider">{key.replace(/_/g, ' ')}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {tableData.map(row => (<tr key={row.id} className="hover:bg-white/5 transition-colors">{Object.keys(row).filter(key => key !== 'id').map(field => (<td key={field} className="px-4 py-2 whitespace-nowrap"><input type="text" value={row[field]} onChange={(e) => handleTableChange(e, row.id, field)} className={tableInputStyle} placeholder="-" /></td>))}</tr>))}
            </tbody>
          </table>
        </div>
        <button onClick={handleAddRow} className={`${btnPrimary} mt-4`}>+ Add Row</button>
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <button onClick={runSimulation} className={`${btnPrimary} text-lg px-8 py-3`} disabled={simulationStatus === 'running'}>
                <i className="fas fa-play"></i> {simulationStatus === 'running' ? 'Running Simulation...' : 'Run Simulation'}
            </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ results, onBack }) => {
  const [message, setMessage] = useState({ text: "", type: "" });
  if (!results || !results.linear || !results.circular) {
    return (
      <div className="text-red-400 text-center p-8">
        Simulation Data Error. Please run a new simulation.
      </div>
    );
  }
  const { linear, circular, material_flow, stage_impact, recommendations } =
    results;

  const downloadReport = async () => {
    setMessage({ text: "Generating PDF report...", type: "info" });
    console.log("Data for report:", {
      linear,
      circular,
      recommendations,
      stage_impact,
    });
    try {
      const payload = { linear, circular, recommendations, stage_impact };
      const response = await axios.post("/api/report", payload, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "lca_report.pdf";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setMessage({
        text: "Report generation successful. Check downloads.",
        type: "success",
      });
    } catch (error) {
      console.error("Report download failed:", error);
      const errorText =
        "Failed to generate report. Ensure the backend is running and check the server console for errors.";
      setMessage({ text: errorText, type: "error" });
      alert(errorText);
    }
  };

  // --- FIX 1: Use the correct keys from the Python API ---
  const co2Reduction = linear.CO2_total_kg
    ? ((1 - circular.CO2_total_kg / linear.CO2_total_kg) * 100).toFixed(1)
    : 0;
  const costSavings = (
    linear.Cost_total_USD - circular.Cost_total_USD
  ).toFixed(2);

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#cbd5e1" },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const totalImpactData = {
    labels: ["Extraction", "Manufacturing", "Transport", "End-of-Life"],
    datasets: [
      {
        label: "Linear CO2 (kg)",
        data: [45.2, 28.7, 12.1, 8.3],
        backgroundColor: "#1FB8CD",
      },
      {
        label: "Circular CO2 (kg)",
        data: [13.6, 15.2, 6.1, 4.9],
        backgroundColor: "#5D878F",
      },
    ],
  };

  const stageImpactData = {
    labels: ["Extraction", "Manufacturing", "Transport", "End-of-Life"],
    datasets: [
      {
        data: [35, 40, 15, 10],
        backgroundColor: ["#1FB8CD", "#FFC185", "#B4413C", "#ECEBD5"],
        borderColor: "#0f172a",
        borderWidth: 4,
      },
    ],
  };

  const materialFlowData = {
    labels: ["Raw Material", "Production", "Use Phase", "End-of-Life"],
    datasets: [
      {
        label: "Material Input (%)",
        data: [100, 85, 72, 68],
        borderColor: "#1FB8CD",
        backgroundColor: "rgba(31, 184, 205, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Recycled Content (%)",
        data: [0, 15, 28, 32],
        borderColor: "#5D878F",
        backgroundColor: "rgba(93, 135, 143, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="animate-fadeIn">
      <MessageBanner message={message.text} type={message.type} />
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Simulation Results Dashboard
        </h2>
        <p className="text-slate-300">
          Analysis complete. Review your key metrics and recommendations below.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <MetricCard
          title="CO₂ Reduction"
          value={`${co2Reduction}%`}
          icon={<i className="fas fa-leaf"></i>}
          color="emerald"
        />
        <MetricCard
          title="Cost Savings"
          value={`$${costSavings}`}
          icon={<i className="fas fa-dollar-sign"></i>}
          color="amber"
        />
        {/* --- FIX 2: Access the nested .MCI property for the score --- */}
        <MetricCard
          title="Circularity Score"
          value={circular.Circularity.MCI.toFixed(2)}
          icon={<i className="fas fa-sync-alt"></i>}
          color="teal"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ChartWrapper
          title="Total Impact: CO2 & Cost"
          className="lg:col-span-1"
        >
          <Bar options={commonChartOptions} data={totalImpactData} />
        </ChartWrapper>
        <ChartWrapper title="Stage-wise Impact" className="lg:col-span-1">
          <Doughnut
            options={{ ...commonChartOptions, cutout: "60%" }}
            data={stageImpactData}
          />
        </ChartWrapper>
        <ChartWrapper title="Material Flow" className="lg:col-span-2">
          <Line options={commonChartOptions} data={materialFlowData} />
        </ChartWrapper>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-lg mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          AI Recommendations
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={index} title={rec.title} text={rec.text} />
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 text-lg font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
        >
          Run New Simulation
        </button>
        <button
          onClick={downloadReport}
          className="px-8 py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity"
        >
          Download Report (PDF)
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => {
  const colors = { emerald: 'from-emerald-400 to-emerald-600', amber: 'from-amber-400 to-amber-600', teal: 'from-teal-400 to-teal-600' };
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center gap-5">
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl text-white bg-gradient-to-br ${colors[color]}`}>{icon}</div>
      <div><p className="text-4xl font-extrabold text-white">{value}</p><h4 className="text-slate-300 font-medium">{title}</h4></div>
    </div>
  );
};

const ChartWrapper = ({ title, children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg ${className}`}>
    <h4 className="text-xl font-bold text-white mb-4 text-center">{title}</h4>
    <div className="bg-black/10 p-4 rounded-lg border border-white/10"><div style={{ position: 'relative', height: '300px' }}>{children}</div></div>
  </div>
);

const RecommendationCard = ({ title, text }) => (
  <div className="bg-black/10 border border-white/10 rounded-lg p-5 flex gap-4 h-full">
    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-xl text-white"><i className="fas fa-lightbulb"></i></div>
    <div><h4 className="font-bold text-white text-lg mb-1">{title}</h4><p className="text-slate-300">{text}</p></div>
  </div>
);

const LoadingOverlay = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const stages = [
      { text: "Data Processing", icon: "fa-database" },
      { text: "Impact Analysis", icon: "fa-chart-line" },
      { text: "Circularity Assessment", icon: "fa-sync-alt" },
      { text: "Report Generation", icon: "fa-check-circle" },
  ];
  useEffect(() => {
      const interval = setInterval(() => {
          setProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  return 100;
              }
              const newProgress = prev + Math.random() * 5 + 2;
              if (newProgress >= 25 && stage < 1) setStage(1);
              if (newProgress >= 50 && stage < 2) setStage(2);
              if (newProgress >= 75 && stage < 3) setStage(3);
              return newProgress;
          });
      }, 400);
      return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex items-center justify-center animate-fadeIn">
        <div className="text-center max-w-lg w-full p-8 sm:p-12 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white text-2xl font-bold mb-2">Processing LCA Analysis</h3>
            <p className="text-slate-300 mb-6">Generating recommendations... {Math.min(100, Math.floor(progress))}%</p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-8">
                <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }}></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {stages.map((s, i) => (
                    <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5 border transition-all duration-300 ${i <= stage ? 'opacity-100 border-white/10' : 'opacity-40 border-transparent'}`}>
                        <i className={`fas ${s.icon} ${i <= stage ? 'text-teal-400' : 'text-slate-300'}`}></i>
                        <span className="text-slate-300 text-xs text-center">{s.text}</span>
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
  const [companyDefaults, setCompanyDefaults] = useState({});
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const response = await axios.get(`/api/defaults/${COMPANY_ID}`);
        if (Object.keys(response.data).length > 0) { setCompanyDefaults(response.data); }
      } catch (error) { console.error('Failed to fetch company defaults:', error); }
      finally { setDefaultsLoaded(true); }
    };
    fetchDefaults();
  }, []);

  const handleStart = () => setCurrentPage('form');
  const handleSimulate = (results) => {
    setSimulationResults(results);
    setCurrentPage('dashboard');
  };
  const handleBack = () => {
    setCurrentPage('form');
    setSimulationResults(null);
  };

  let content;
  if (!defaultsLoaded) {
    content = <div className="flex justify-center items-center h-screen text-teal-400 text-xl">Loading...</div>;
  } else if (currentPage === 'landing') {
    content = <LandingPage onStart={handleStart} />;
  } else if (currentPage === 'form') {
    content = (
      <div>
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">LCA Project Dashboard</h2>
          <p className="text-slate-300">Set up and analyze your lifecycle assessment projects.</p>
        </div>
        <details className="mb-8">
          <summary className="cursor-pointer bg-white/5 p-4 rounded-xl text-lg font-semibold text-white hover:bg-white/10 transition">
            ⚙️ Optional: Configure Company AI Parameters
          </summary>
          <div className="mt-4">
            <CompanyDefaultsForm onSetDefaults={setCompanyDefaults} defaults={companyDefaults} isLoaded={defaultsLoaded} />
          </div>
        </details>
        <LCAForm onSimulate={handleSimulate} companyDefaults={companyDefaults} simulationStatus={simulationStatus} setSimulationStatus={setSimulationStatus} />
      </div>
    );
  } else if (currentPage === 'dashboard' && simulationResults) {
    content = <Dashboard results={simulationResults} onBack={handleBack} />;
  } else {
    content = <div className="text-red-400 text-center p-8">Application Error: Invalid Page State.</div>;
  }

  return (
    <main className="min-h-screen w-full text-white p-4 sm:p-8">
      {simulationStatus === 'running' && <LoadingOverlay />}
      <div className="max-w-7xl mx-auto">{content}</div>
    </main>
  );
}

export default LCADashboard;