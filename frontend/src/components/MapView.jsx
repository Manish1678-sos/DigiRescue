import React, { useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Polyline, 
  Marker, 
  Popup, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { Activity, ShieldAlert, Home, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker asset paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to handle smooth panning/zooming when a zone is selected
function MapController({ selectedZone }) {
  const map = useMap();

  useEffect(() => {
    if (selectedZone && selectedZone.bounds && selectedZone.bounds.length > 0) {
      map.fitBounds(selectedZone.bounds, { 
        padding: [50, 50], 
        maxZoom: 10,
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedZone, map]);

  return null;
}

// Custom Shelter DivIcon Generator
const createShelterIcon = (status, occPct) => {
  let bgColor = 'bg-emerald-500';
  let borderGlow = 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  if (status === 'SUBMERGED_EVACUATE') {
    bgColor = 'bg-red-600 animate-bounce';
    borderGlow = 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]';
  } else if (status === 'OVERCROWDED') {
    bgColor = 'bg-red-500';
    borderGlow = 'border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  } else if (status === 'NEAR_CAPACITY') {
    bgColor = 'bg-amber-500';
    borderGlow = 'border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full ${bgColor} border-2 ${borderGlow} flex items-center justify-center text-white text-xs font-bold shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div class="absolute -bottom-2 font-mono text-[9px] font-bold px-1.5 py-0.2 bg-slate-900 text-white rounded border border-slate-700 shadow">
        ${occPct}%
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-shelter-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom Medical Unit DivIcon
const createMedicalIcon = () => {
  return L.divIcon({
    html: `
      <div class="w-7 h-7 rounded-lg bg-indigo-600 border-2 border-indigo-300 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
      </div>
    `,
    className: 'custom-medical-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function MapView({ simulationData, selectedZone, onSelectZone }) {
  const center = [20, 0];
  const zoom = 2;

  const safeData = simulationData || {};
  const { zones = [], roads = [], shelters = [], medical_units = [], evacuation_routes = [] } = safeData;

  const getZoneColor = (level, isIsolated) => {
    if (isIsolated) return '#dc2626';
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getRoadStyle = (status) => {
    switch (status) {
      case 'IMPASSABLE':
        return { color: '#ef4444', weight: 4, dashArray: '8, 8', opacity: 0.9 };
      case 'CAUTION':
        return { color: '#f59e0b', weight: 3, dashArray: '4, 4', opacity: 0.85 };
      default:
        return { color: '#06b6d4', weight: 3, opacity: 0.7 };
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        minZoom={2}
        maxZoom={18}
        worldCopyJump={true}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController selectedZone={selectedZone} />

        {/* Free OpenStreetMap Standard / Dark-compatible Tile Layer (No API Key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Zone Polygons */}
        {zones.map((zone) => {
          const color = getZoneColor(zone.risk_level, zone.is_isolated);
          const isSelected = selectedZone?.id === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={zone.bounds}
              pathOptions={{
                color: isSelected ? '#38bdf8' : color,
                fillColor: color,
                fillOpacity: zone.risk_score > 60 ? 0.45 : 0.25,
                weight: isSelected ? 3 : 1.5,
                dashArray: zone.is_isolated ? '5, 5' : null
              }}
              eventHandlers={{
                click: () => onSelectZone(zone)
              }}
            >
              <Tooltip sticky className="bg-slate-900 text-white font-sans text-xs border border-slate-700 rounded shadow-lg">
                <div className="p-1">
                  <p className="font-bold text-cyan-300">{zone.name}</p>
                  <p className="text-[11px] text-slate-300">Elev: {zone.elevation_m}m | Risk: <span className="font-bold" style={{ color }}>{zone.risk_score}/100 ({zone.risk_level})</span></p>
                  <p className="text-[11px] text-slate-300">Water Depth: <span className="font-mono text-cyan-400 font-bold">{zone.current_water_level_m}m</span></p>
                  {zone.is_isolated && <p className="text-[11px] font-bold text-red-400 mt-0.5">⚠️ PHYSICALLY ISOLATED</p>}
                </div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Render Road Segments */}
        {roads.map((road) => {
          const style = getRoadStyle(road.status);
          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={style}
            >
              <Tooltip sticky className="bg-slate-900 text-white font-sans text-xs border border-slate-700 rounded">
                <div className="p-1">
                  <p className="font-semibold text-slate-200">{road.name} {road.is_bridge ? '(Bridge)' : ''}</p>
                  <p className="text-[11px] text-slate-400">Status: <span className="font-bold" style={{ color: style.color }}>{road.status}</span> | Water Depth: {road.water_depth_m}m</p>
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Render Evacuation Routes Polylines */}
        {evacuation_routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.waypoints}
            pathOptions={{
              color: '#38bdf8',
              weight: 5,
              opacity: 0.95,
              dashArray: '10, 6'
            }}
          >
            <Tooltip sticky className="bg-slate-900 text-white text-xs border border-slate-700 rounded">
              <div className="p-1">
                <p className="font-bold text-sky-400">Safe Evacuation Route</p>
                <p className="text-[11px]">To: {route.target_shelter_name}</p>
                <p className="text-[11px]">Est. Time: {route.estimated_travel_time_min} mins</p>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {/* Render Shelter Markers */}
        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.lat, shelter.lng]}
            icon={createShelterIcon(shelter.status, shelter.occupancy_pct)}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1.5 font-sans text-slate-200">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                  <h4 className="font-bold text-sm text-cyan-300">{shelter.name}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {shelter.elevation_m}m Elev
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="flex justify-between gap-4">
                    <span>Occupancy:</span>
                    <span className="font-mono font-bold text-cyan-400">{shelter.current_occupancy.toLocaleString()} / {shelter.total_capacity.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>Status:</span>
                    <span className={`font-bold ${shelter.status === 'OVERCROWDED' || shelter.status === 'SUBMERGED_EVACUATE' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {shelter.status}
                    </span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span>Medical Onsite:</span>
                    <span className="text-indigo-400">{shelter.medical_unit_onsite ? 'Yes' : 'No'}</span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Medical Units */}
        {medical_units.map((med) => (
          <Marker
            key={med.id}
            position={[med.lat, med.lng]}
            icon={createMedicalIcon()}
          >
            <Popup className="custom-popup">
              <div className="p-1 font-sans text-xs space-y-1 text-slate-200">
                <p className="font-bold text-indigo-300">{med.name}</p>
                <p className="text-slate-300">Type: {med.type}</p>
                <p className="text-slate-400">Status: <span className="text-emerald-400 font-semibold">{med.status}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs font-sans shadow-2xl backdrop-blur-md">
        <p className="font-bold text-slate-200 mb-2 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> Global View Legend
        </p>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 border border-red-400 inline-block"></span>
            <span className="text-slate-300">Critical Risk / Isolated Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400 inline-block"></span>
            <span className="text-slate-300">Moderate / High Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-b-2 border-dashed border-red-500 inline-block"></span>
            <span className="text-slate-300">Impassable Submerged Road</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-sky-400 border-b-2 border-dashed border-sky-300 inline-block"></span>
            <span className="text-slate-300">Active Evacuation Corridor</span>
          </div>
        </div>
      </div>
    </div>
  );
}