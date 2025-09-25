import React, { useState } from 'react';
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

const LCAForm = ({
  onSimulate
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
    energy_manufacturing: '',
    transport_km: '500',
    transport_mode: 'Truck',
    eol_method: 'Recycling',
    recycling_yield: '90',
    co2_extraction: '8',
    co2_manufacturing: '',
    material_cost: '0.02',
    transport_cost: '0.005'
  }]);

  const [isUploading, setIsUploading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);

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
      }, 1500);
    }
  };

  const handleAIAutoFill = () => {
    const filledData = tableData.map(row => {
      const filledRow = {
        ...row
      };
      if (filledRow.co2_manufacturing === '') {
        filledRow.co2_manufacturing = '0.35';
      }
      if (filledRow.energy_manufacturing === '') {
        filledRow.energy_manufacturing = '5';
      }
      return filledRow;
    });
    setTableData(filledData);
    alert('AI-assisted values have been filled in!');
  };

  const runSimulation = async () => {
    setSimulationStatus('running');

    // Create the data structure that matches the FastAPI ProjectData model
    const payload = {
      Weight_kg: tableData.map(row => parseFloat(row.weight_kg) || null),
      Recycled_Content_percent: tableData.map(row => parseFloat(row.recycled_content) || null),
      Energy_Extraction_MJ: tableData.map(row => parseFloat(row.energy_extraction) || null),
      Energy_Manufacturing_MJ: tableData.map(row => parseFloat(row.energy_manufacturing) || null),
      Transport_km: tableData.map(row => parseFloat(row.transport_km) || null),
      Transport_Mode: tableData.map(row => row.transport_mode || 'truck'), // Default to 'truck' if empty
      CO2_Extraction_kg: tableData.map(row => parseFloat(row.co2_extraction) || null),
      CO2_Manufacturing_kg: tableData.map(row => parseFloat(row.co2_manufacturing) || null),
      Material_Cost_USD: tableData.map(row => parseFloat(row.material_cost) || null),
      Transport_Cost_USD: tableData.map(row => parseFloat(row.transport_cost) || null),
    };

    try {
      const response = await axios.post('/api/simulate', payload);
      const {
        results
      } = response.data;

      // Re-map the API response to the front-end's expected format
      const frontEndResults = {
        linear: {
          co2_total: results.linear.CO2_total_kg,
          cost_total: results.linear.Cost_total_USD,
        },
        circular: {
          co2_total: results.circular.CO2_total_kg,
          cost_total: results.circular.Cost_total_USD,
        },
        material_flow: {
          labels: ['Virgin', 'Recycled', 'Loss'],
          data: [100 - (payload.Recycled_Content_percent[0] || 0), (payload.Recycled_Content_percent[0] || 0), 10], // Simplified mock data
          backgroundColor: ['#f87171', '#4ade80', '#94a3b8']
        },
        stage_impact: {
          labels: ['Extraction', 'Processing', 'Transport', 'EoL'],
          linear: [results.linear.CO2_total_kg / 2, results.linear.CO2_total_kg / 4, results.linear.CO2_total_kg / 8, results.linear.CO2_total_kg / 8],
          circular: [results.circular.CO2_total_kg / 2, results.circular.CO2_total_kg / 4, results.circular.CO2_total_kg / 8, results.circular.CO2_total_kg / 8]
        },
        recommendations: [{
          title: 'Optimal Scenario',
          text: results.recommendation
        }, {
          title: 'Increase Recycled Content',
          text: `Based on your data, increasing recycled content could further reduce CO₂ emissions.`
        }, ],
      };

      onSimulate(frontEndResults);
      setSimulationStatus('completed');
    } catch (error) {
      console.error('Simulation failed:', error);
      setSimulationStatus('error');
      alert('Failed to run simulation. Check the backend server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">
          LCA Project Dashboard
        </h1>

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

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Data Input</h2>
          <div className="flex justify-between items-center mb-4">
            <label className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300">
              {isUploading ? 'Uploading...' : 'Upload CSV File'}
              <input type="file" onChange={handleFileChange} className="hidden" accept=".csv" disabled={isUploading} />
            </label>
            <button onClick={handleAIAutoFill} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              💡 Suggest with AI
            </button>
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
                          className="w-full bg-transparent border-none text-gray-300 focus:outline-none"
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
  const {
    linear,
    circular,
    material_flow,
    stage_impact,
    recommendations
  } = results;

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

  const downloadReport = () => {
    alert('Simulating report download...');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">
          Simulation Results Dashboard
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <StatCard
            title="CO₂ Reduction"
            value={`${((1 - (circular.co2_total / linear.co2_total)) * 100).toFixed(1)}%`}
            color="text-green-400"
          />
          <StatCard
            title="Cost Savings"
            value={`$${(linear.cost_total - circular.cost_total).toFixed(2)}`}
            color="text-teal-400"
          />
          <StatCard
            title="Circularity Score"
            value="0.78"
            color="text-sky-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Total Impact (CO₂ & Cost)">
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
          <ChartCard title="Material Flow (Simulated)">
            <Pie data={materialFlowData} />
          </ChartCard>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">AI-Driven Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} title={rec.title} text={rec.text} />
            ))}
          </div>
        </div>

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
            Download Report (PDF/Excel)
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
      {currentPage === 'form' && <LCAForm onSimulate={handleSimulate} />}
      {currentPage === 'dashboard' && simulationResults && <Dashboard results={simulationResults} onBack={handleBack} />}
    </div>
  );
}

export default App;
