import { useState } from "react";

export default function LCAForm({ onSubmit }) {
  const [metal, setMetal] = useState("aluminium");
  const [route, setRoute] = useState("raw");
  const [energyUse, setEnergyUse] = useState("");
  const [transport, setTransport] = useState("");
  const [endOfLife, setEndOfLife] = useState("recycled");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      metal,
      route,
      energyUse: Number(energyUse),
      transport,
      endOfLife,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4"
    >
      {/* Metal */}
      <div className="flex flex-col space-y-1">
        <label className="font-medium text-gray-700">Metal:</label>
        <select
          value={metal}
          onChange={(e) => setMetal(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="aluminium">Aluminium</option>
          <option value="copper">Copper</option>
        </select>
      </div>

      {/* Production Route */}
      <div className="flex flex-col space-y-2">
        <span className="font-medium text-gray-700">Production Route:</span>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="raw"
              checked={route === "raw"}
              onChange={(e) => setRoute(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Raw</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="recycled"
              checked={route === "recycled"}
              onChange={(e) => setRoute(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>Recycled</span>
          </label>
        </div>
      </div>

      {/* Energy Use */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="energyUse" className="font-medium text-gray-700">
          Energy Use (MJ/kg):
        </label>
        <input
          id="energyUse"
          type="number"
          value={energyUse}
          onChange={(e) => setEnergyUse(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Transport */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="transport" className="font-medium text-gray-700">
          Transport:
        </label>
        <input
          id="transport"
          type="text"
          value={transport}
          onChange={(e) => setTransport(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., truck, ship"
          required
        />
      </div>

      {/* End of Life */}
      <div className="flex flex-col space-y-1">
        <label className="font-medium text-gray-700">End of Life:</label>
        <select
          value={endOfLife}
          onChange={(e) => setEndOfLife(e.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="recycled">Recycled</option>
          <option value="disposed">Disposed</option>
          <option value="reused">Reused</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
}
