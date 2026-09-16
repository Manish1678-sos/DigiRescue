import React, { useState } from 'react';
import { Home, Navigation, Crosshair, AlertTriangle, ShieldCheck, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function ResourceList({ simulationData }) {
  const [activeTab, setActiveTab] = useState('shelters');

  if (!simulationData) return null;

  const { shelters = [], evacuation_routes = [], medical_units = [] } = simulationData;

  const getOccupancyColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col gap-3 font-sans h-full overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 pb-2 gap-2">
        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'shelters'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Shelters ({shelters.length})
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'routes'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Evacuation Routes ({evacuation_routes.length})
        </button>

        <button
          onClick={() => setActiveTab('medical')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'medical'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          Medical Units ({medical_units.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
        {/* TAB 1: SHELTERS */}
        {activeTab === 'shelters' && shelters.map((shelter) => (
          <div key={shelter.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-cyan-400" /> {shelter.name}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                shelter.status === 'SUBMERGED_EVACUATE' || shelter.status === 'OVERCROWDED'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {shelter.status}
              </span>
            </div>

            {/* Occupancy Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Occupancy</span>
                <span className="font-bold text-slate-200">
                  {shelter.current_occupancy.toLocaleString()} / {shelter.total_capacity.toLocaleString()} ({shelter.occupancy_pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getOccupancyColor(shelter.occupancy_pct)} transition-all duration-500`}
                  style={{ width: `${Math.min(100, shelter.occupancy_pct)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
              <span>Elevation: <strong className="text-slate-300">{shelter.elevation_m}m</strong></span>
              <span>Supplies: <strong className={shelter.supplies_status === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}>{shelter.supplies_status}</strong></span>
            </div>
          </div>
        ))}

        {/* TAB 2: EVACUATION ROUTES */}
        {activeTab === 'routes' && evacuation_routes.map((route) => (
          <div key={route.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{route.origin_zone_name}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <span className="text-cyan-300 truncate">{route.target_shelter_name}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded border border-slate-800/60 font-mono text-[11px]">
              <div>
                <p className="text-slate-500 text-[10px]">Distance</p>
                <p className="font-bold text-slate-200">{route.total_distance_km} km</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">Est. Transit</p>
                <p className="font-bold text-cyan-400">{route.estimated_travel_time_min} mins</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">Rating</p>
                <p className={`font-bold ${
                  route.safety_rating === 'HAZARDOUS' ? 'text-red-400' : route.safety_rating === 'MODERATE_RISK' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {route.safety_rating}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* TAB 3: MEDICAL UNITS */}
        {activeTab === 'medical' && medical_units.map((unit) => (
          <div key={unit.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-100">{unit.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">Type: {unit.type}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              unit.status === 'DISPATCHED' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' : 'bg-slate-800 text-slate-300'
            }`}>
              {unit.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
