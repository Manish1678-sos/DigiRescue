import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import SimulationPanel from './components/SimulationPanel';
import ResourceList from './components/ResourceList';
import AIAssistant from './components/AIAssistant';
import { fetchInitialState, runSimulationApi } from './services/api';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState({
    rainfall_mm_hr: 25.0,
    storm_surge_m: 0.5,
    dam_release_m3s: 200.0,
    wind_speed_kmh: 35.0,
    infrastructure_age: 30.0,
    population_density_mult: 1.0,
    time_horizon_hrs: 0.0,
  });

  const [simulationData, setSimulationData] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      const data = await fetchInitialState();
      setSimulationData(data);
      setLoading(false);
    }
    init();
  }, []);

  // Update simulation whenever params change
  useEffect(() => {
    let isSubscribed = true;
    async function updateSim() {
      const data = await runSimulationApi(params);
      if (isSubscribed) {
        setSimulationData(data);
      }
    }
    const timer = setTimeout(() => {
      updateSim();
    }, 150);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [params]);

  const handlePreset = (newParams) => {
    setParams((prev) => ({
      ...prev,
      ...newParams
    }));
  };

  const handleReset = () => {
    setParams({
      rainfall_mm_hr: 25.0,
      storm_surge_m: 0.5,
      dam_release_m3s: 200.0,
      wind_speed_kmh: 35.0,
      infrastructure_age: 30.0,
      population_density_mult: 1.0,
      time_horizon_hrs: 0.0,
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Command Center Dashboard Header */}
      <Dashboard 
        simulationData={simulationData} 
        onOpenAI={() => setIsAIOpen(true)} 
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        {/* Left Column: Simulation Controls (3 Cols) */}
        <div className="lg:col-span-3 h-full min-h-[500px]">
          <SimulationPanel
            params={params}
            onChangeParams={setParams}
            onPreset={handlePreset}
            onReset={handleReset}
          />
        </div>

        {/* Center Column: Digital Twin Interactive Map (6 Cols) */}
        <div className="lg:col-span-6 h-full min-h-[500px]">
          <MapView
            simulationData={simulationData}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
          />
        </div>

        {/* Right Column: Resource, Shelter & Evacuation Routing (3 Cols) */}
        <div className="lg:col-span-3 h-full min-h-[500px]">
          <ResourceList simulationData={simulationData} />
        </div>
      </main>

      {/* Floating Tactical AI Assistant Drawer */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        simulationState={simulationData}
      />
    </div>
  );
}
