import React from 'react';
import { 
  ShieldAlert, 
  Users, 
  Navigation, 
  Home, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Activity,
  Flame,
  Radio
} from 'lucide-react';

export default function Dashboard({ simulationData, onOpenAI }) {
  if (!simulationData) return null;

  const {
    overall_threat_level,
    total_population_at_risk,
    total_submerged_roads_km,
    isolated_zones_count,
    shelters_overcrowded_count,
    power_substations_down,
    alerts = [],
    hourly_forecast = []
  } = simulationData;

  const getThreatBadge = (level) => {
    switch (level) {
      case 'CATASTROPHIC':
        return 'bg-red-950/80 text-red-400 border-red-500/50 glow-red animate-pulse';
      case 'SEVERE':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50';
      case 'ELEVATED':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <header className="w-full bg-[#0b0f19]/90 border-b border-slate-800/80 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                DigiRescue
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Digital Twin v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Disaster Prediction & Dynamic Evacuation Twin • <span className="text-cyan-400 font-mono">"What happens if...?"</span>
            </p>
          </div>
        </div>

        {/* Global Threat & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Threat Level Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs uppercase tracking-wider ${getThreatBadge(overall_threat_level)}`}>
            <Activity className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Threat: {overall_threat_level}</span>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/20 transition-all border border-cyan-400/30"
          >
            <Radio className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span>AI Command Assistant</span>
          </button>
        </div>
      </div>

      {/* Telemetry Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* Metric 1 */}
        <div className="glass-card rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Pop. at Risk</p>
            <p className="text-lg font-bold font-mono text-amber-400">
              {total_population_at_risk.toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Submerged Roads</p>
            <p className="text-lg font-bold font-mono text-cyan-400">
              {total_submerged_roads_km} <span className="text-xs text-slate-400">km</span>
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Navigation className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Isolated Districts</p>
            <p className={`text-lg font-bold font-mono ${isolated_zones_count > 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {isolated_zones_count}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isolated_zones_count > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Shelter Overcrowd</p>
            <p className={`text-lg font-bold font-mono ${shelters_overcrowded_count > 0 ? 'text-orange-400' : 'text-slate-200'}`}>
              {shelters_overcrowded_count}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Home className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-card rounded-lg p-2.5 border border-slate-800 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-medium">Grid Outages</p>
            <p className={`text-lg font-bold font-mono ${power_substations_down > 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {power_substations_down} <span className="text-xs text-slate-400">stations</span>
            </p>
          </div>
          <div className={`p-2 rounded-lg ${power_substations_down > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Ticker Banner if critical alerts exist */}
      {alerts.length > 0 && (
        <div className="mt-2.5 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-1.5 flex items-center gap-2 overflow-hidden text-xs">
          <Flame className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
          <span className="font-semibold text-red-300 font-mono uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-red-900/60 flex-shrink-0">
            {alerts[0].severity}
          </span>
          <p className="text-slate-300 truncate font-medium">
            <span className="text-white font-semibold">{alerts[0].title}:</span> {alerts[0].message}
          </p>
        </div>
      )}
    </header>
  );
}
