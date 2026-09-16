import React from 'react';
import { Sliders, Flame, CloudRain, Waves, Wind, ShieldAlert, Clock, RefreshCw, Layers, Globe } from 'lucide-react';

export default function SimulationPanel({ params, onChangeParams, onPreset, onReset, selectedRegion, onChangeRegion }) {
  const PRESETS = [
    {
      id: 'hurricane',
      name: 'Cat 3 Hurricane',
      icon: Wind,
      color: 'from-orange-600 to-red-600',
      params: { rainfall_mm_hr: 95.0, storm_surge_m: 3.2, dam_release_m3s: 800.0, wind_speed_kmh: 125.0, time_horizon_hrs: 6.0 }
    },
    {
      id: 'flashflood',
      name: 'Flash Flood',
      icon: CloudRain,
      color: 'from-cyan-600 to-blue-600',
      params: { rainfall_mm_hr: 140.0, storm_surge_m: 1.1, dam_release_m3s: 1200.0, wind_speed_kmh: 45.0, time_horizon_hrs: 3.0 }
    },
    {
      id: 'dambreach',
      name: 'Dam Breach',
      icon: Waves,
      color: 'from-purple-600 to-indigo-600',
      params: { rainfall_mm_hr: 60.0, storm_surge_m: 0.8, dam_release_m3s: 4200.0, wind_speed_kmh: 30.0, time_horizon_hrs: 4.0 }
    },
    {
      id: 'baseline',
      name: 'Normal Weather',
      icon: RefreshCw,
      color: 'from-slate-700 to-slate-800',
      params: { rainfall_mm_hr: 15.0, storm_surge_m: 0.3, dam_release_m3s: 150.0, wind_speed_kmh: 20.0, time_horizon_hrs: 0.0 }
    }
  ];

  const handleSliderChange = (field, val) => {
    onChangeParams({
      ...params,
      [field]: parseFloat(val)
    });
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col gap-4 font-sans h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-slate-100 font-mono tracking-tight">
            "What-If" Simulation Controls
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded bg-slate-800/80 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Region Selector Dropdown */}
      <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
        <label className="text-[11px] uppercase tracking-wider font-mono font-semibold text-cyan-400 flex items-center gap-1.5 mb-1">
          <Globe className="w-3.5 h-3.5" /> Target Simulation Region
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => onChangeRegion(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md p-2 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="miami">Miami, USA (Coastal Basin)</option>
          <option value="kolkata">Kolkata, India (Delta Region)</option>
          <option value="tokyo">Tokyo, Japan (Bay Area)</option>
          <option value="london">London, UK (Thames Estuary)</option>
        </select>
      </div>

      {/* Scenario Presets */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-mono font-semibold text-slate-400 block mb-2">
          Disaster Preset Scenarios
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => {
            const IconComponent = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => onPreset(p.params)}
                className={`flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r ${p.color} text-white font-medium text-xs hover:brightness-110 transition-all shadow-md border border-white/10`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3.5">
        {/* Slider 1: Rainfall */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rainfall Intensity
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {params.rainfall_mm_hr} <span className="text-[10px] text-slate-400">mm/hr</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={params.rainfall_mm_hr}
            onChange={(e) => handleSliderChange('rainfall_mm_hr', e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Slider 2: Storm Surge */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-blue-400" /> Storm Surge / Tide Height
            </span>
            <span className="font-mono font-bold text-blue-400">
              {params.storm_surge_m} <span className="text-[10px] text-slate-400">meters</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={params.storm_surge_m}
            onChange={(e) => handleSliderChange('storm_surge_m', e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>

        {/* Slider 3: Dam Release */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-purple-400" /> Dam Discharge Rate
            </span>
            <span className="font-mono font-bold text-purple-400">
              {params.dam_release_m3s} <span className="text-[10px] text-slate-400">m³/s</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={params.dam_release_m3s}
            onChange={(e) => handleSliderChange('dam_release_m3s', e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* Slider 4: Wind Speed */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind Velocity
            </span>
            <span className="font-mono font-bold text-amber-400">
              {params.wind_speed_kmh} <span className="text-[10px] text-slate-400">km/h</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={params.wind_speed_kmh}
            onChange={(e) => handleSliderChange('wind_speed_kmh', e.target.value)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Slider 5: Timeline Horizon */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-200 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Predictive Time Scrubber
            </span>
            <span className="font-mono font-bold text-emerald-400">
              +{params.time_horizon_hrs} <span className="text-[10px] text-slate-400">hours forecast</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={params.time_horizon_hrs}
            onChange={(e) => handleSliderChange('time_horizon_hrs', e.target.value)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>t=0h (Now)</span>
            <span>+6h</span>
            <span>+12h</span>
            <span>+24h</span>
          </div>
        </div>
      </div>
    </div>
  );
}