import axios from 'axios';

const API_BASE_URL = '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchInitialState = async () => {
  try {
    const response = await client.get('/initial-state');
    return response.data;
  } catch (error) {
    console.warn('Backend connection unavailable, using initial simulation response fallback.', error);
    return getFallbackSimulation({
      rainfall_mm_hr: 25.0,
      storm_surge_m: 0.5,
      dam_release_m3s: 200.0,
      wind_speed_kmh: 35.0,
      infrastructure_age: 30.0,
      population_density_mult: 1.0,
      time_horizon_hrs: 0.0,
    });
  }
};

export const runSimulationApi = async (params) => {
  try {
    const response = await client.post('/simulate', params);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, executing client-side dynamic cascade fallback.', error);
    return getFallbackSimulation(params);
  }
};

export const sendAIChatApi = async (query, simulationState) => {
  try {
    const response = await client.post('/ai/chat', {
      query,
      simulation_state: simulationState,
    });
    return response.data;
  } catch (error) {
    console.warn('Backend AI endpoint unavailable, executing client-side AI analysis fallback.', error);
    return getFallbackAIChat(query, simulationState);
  }
};

// Client-side Fallback Simulation Engine
function getFallbackSimulation(params) {
  const rain = params.rainfall_mm_hr || 25.0;
  const surge = params.storm_surge_m || 0.5;
  const dam = params.dam_release_m3s || 200.0;
  const wind = params.wind_speed_kmh || 35.0;
  const timeH = params.time_horizon_hrs || 0.0;
  const density = params.population_density_mult || 1.0;

  const timeFactor = 1.0 + timeH * 0.15;

  const rawZones = [
    { id: "zone_harbor_bay", name: "Harbor Bay Coastal District", category: "Coastal Lowland", elevation_m: 1.2, population: 42000, area_km2: 8.5, drainage_capacity_mm_hr: 20.0, bounds: [[25.7850, -80.1980], [25.7850, -80.1700], [25.7600, -80.1700], [25.7600, -80.1980]], center: [25.7725, -80.1840] },
    { id: "zone_river_delta", name: "Riverfront Central Basin", category: "Riverbed Delta", elevation_m: 2.1, population: 65000, area_km2: 11.2, drainage_capacity_mm_hr: 25.0, bounds: [[25.7850, -80.2250], [25.7850, -80.1980], [25.7600, -80.1980], [25.7600, -80.2250]], center: [25.7725, -80.2115] },
    { id: "zone_downtown", name: "Downtown Commercial Hub", category: "Urban Dense Core", elevation_m: 4.5, population: 88000, area_km2: 6.8, drainage_capacity_mm_hr: 35.0, bounds: [[25.8050, -80.2050], [25.8050, -80.1750], [25.7850, -80.1750], [25.7850, -80.2050]], center: [25.7950, -80.1900] },
    { id: "zone_west_industrial", name: "Westside Industrial & Grid", category: "Industrial & Substation", elevation_m: 1.8, population: 18000, area_km2: 14.0, drainage_capacity_mm_hr: 15.0, bounds: [[25.8050, -80.2500], [25.8050, -80.2050], [25.7850, -80.2050], [25.7850, -80.2500]], center: [25.7950, -80.2275] },
    { id: "zone_east_suburbs", name: "East Coastal Heights", category: "Elevated Suburbs", elevation_m: 8.5, population: 54000, area_km2: 9.6, drainage_capacity_mm_hr: 45.0, bounds: [[25.8250, -80.1750], [25.8250, -80.1500], [25.7850, -80.1500], [25.7850, -80.1750]], center: [25.8050, -80.1625] },
    { id: "zone_north_hills", name: "North Ridge High Ground", category: "Highland Refuge", elevation_m: 18.2, population: 30000, area_km2: 16.5, drainage_capacity_mm_hr: 60.0, bounds: [[25.8350, -80.2300], [25.8350, -80.1750], [25.8050, -80.1750], [25.8050, -80.2300]], center: [25.8200, -80.2025] }
  ];

  let popAtRisk = 0;
  let isolatedCount = 0;
  let powerDown = 0;

  const processedZones = rawZones.map(z => {
    const rainExcess = Math.max(0, rain - z.drainage_capacity_mm_hr) * 0.015 * timeFactor;
    const surgeImp = Math.max(0, surge - z.elevation_m * 0.5) * 0.6;
    const damImp = (z.id === 'zone_river_delta' || z.id === 'zone_west_industrial') ? (dam / 1000) * 0.45 * timeFactor : 0;
    const windImp = (wind / 150) * 0.2;

    const water = Math.round((rainExcess + surgeImp + damImp + windImp) * 100) / 100;
    const submergedPct = Math.min(100, Math.round((water / Math.max(0.5, z.elevation_m)) * 35));

    const riskRaw = (water * 28 + Math.max(0, 15 - z.elevation_m) * 2.2 + wind * 0.2 + (density - 1) * 15);
    const riskScore = Math.min(100, Math.max(0, Math.round(riskRaw * 10) / 10));

    let riskLevel = "LOW";
    if (riskScore >= 80) riskLevel = "CRITICAL";
    else if (riskScore >= 55) riskLevel = "HIGH";
    else if (riskScore >= 25) riskLevel = "MODERATE";

    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
      popAtRisk += Math.round(z.population * (riskScore / 100));
    }

    let powerStatus = "ONLINE";
    if (water > 0.65 || wind > 110 || riskScore > 85) {
      powerStatus = "OFFLINE";
      powerDown++;
    } else if (water > 0.3 || wind > 70 || riskScore > 50) {
      powerStatus = "DEGRADED";
    }

    const isIsolated = (z.id === "zone_harbor_bay" || z.id === "zone_river_delta") && (surge > 2.0 || rain > 110);
    if (isIsolated) isolatedCount++;

    return {
      ...z,
      current_water_level_m: water,
      risk_score: riskScore,
      risk_level: riskLevel,
      is_isolated: isIsolated,
      power_grid_status: powerStatus,
      submerged_area_pct: submergedPct
    };
  });

  const rawRoads = [
    { id: "road_1", name: "Harbor Bay Highway", from_zone_id: "zone_harbor_bay", to_zone_id: "zone_downtown", length_km: 3.2, elevation_m: 1.5, is_bridge: false, max_throughput_veh_hr: 2500, coordinates: [[25.7725, -80.1840], [25.7820, -80.1870], [25.7950, -80.1900]] },
    { id: "road_2", name: "River Delta Bridge Expressway", from_zone_id: "zone_river_delta", to_zone_id: "zone_west_industrial", length_km: 2.8, elevation_m: 1.2, is_bridge: true, max_throughput_veh_hr: 1800, coordinates: [[25.7725, -80.2115], [25.7840, -80.2200], [25.7950, -80.2275]] },
    { id: "road_3", name: "Central Metro Arterial", from_zone_id: "zone_river_delta", to_zone_id: "zone_downtown", length_km: 3.1, elevation_m: 3.2, is_bridge: false, max_throughput_veh_hr: 3200, coordinates: [[25.7725, -80.2115], [25.7850, -80.2000], [25.7950, -80.1900]] },
    { id: "road_4", name: "North Ridge Highland Pass", from_zone_id: "zone_downtown", to_zone_id: "zone_north_hills", length_km: 4.5, elevation_m: 9.5, is_bridge: false, max_throughput_veh_hr: 2000, coordinates: [[25.7950, -80.1900], [25.8080, -80.1950], [25.8200, -80.2025]] },
    { id: "road_5", name: "Eastside Coastal Causeway", from_zone_id: "zone_downtown", to_zone_id: "zone_east_suburbs", length_km: 3.8, elevation_m: 5.0, is_bridge: true, max_throughput_veh_hr: 2800, coordinates: [[25.7950, -80.1900], [25.8000, -80.1750], [25.8050, -80.1625]] },
    { id: "road_6", name: "West Industrial Ridge Link", from_zone_id: "zone_west_industrial", to_zone_id: "zone_north_hills", length_km: 4.2, elevation_m: 6.0, is_bridge: false, max_throughput_veh_hr: 1500, coordinates: [[25.7950, -80.2275], [25.8100, -80.2150], [25.8200, -80.2025]] },
    { id: "road_7", name: "Harbor Delta Connector", from_zone_id: "zone_harbor_bay", to_zone_id: "zone_river_delta", length_km: 2.5, elevation_m: 1.1, is_bridge: false, max_throughput_veh_hr: 1600, coordinates: [[25.7725, -80.1840], [25.7725, -80.1980], [25.7725, -80.2115]] }
  ];

  let submergedRoadsKm = 0;
  const processedRoads = rawRoads.map(r => {
    const fZone = processedZones.find(z => z.id === r.from_zone_id);
    const tZone = processedZones.find(z => z.id === r.to_zone_id);
    const avgW = ((fZone?.current_water_level_m || 0) + (tZone?.current_water_level_m || 0)) / 2;
    const depth = Math.max(0, Math.round((avgW - r.elevation_m * 0.2) * 100) / 100);

    let status = "CLEAR";
    if ((r.is_bridge && wind > 95) || depth >= 0.5) status = "IMPASSABLE";
    else if (depth >= 0.25) status = "CAUTION";

    if (status !== "CLEAR") submergedRoadsKm += r.length_km;

    return {
      ...r,
      water_depth_m: depth,
      status: status
    };
  });

  const rawShelters = [
    { id: "shelter_1", name: "North Ridge Arena Refuge", zone_id: "zone_north_hills", lat: 25.8220, lng: -80.2050, elevation_m: 19.5, total_capacity: 15000, current_occupancy: 3200, supplies_status: "ADEQUATE", medical_unit_onsite: true },
    { id: "shelter_2", name: "Eastside Civic Complex", zone_id: "zone_east_suburbs", lat: 25.8080, lng: -80.1600, elevation_m: 9.0, total_capacity: 12000, current_occupancy: 4100, supplies_status: "ADEQUATE", medical_unit_onsite: true },
    { id: "shelter_3", name: "Metro Stadium Hub", zone_id: "zone_downtown", lat: 25.7970, lng: -80.1880, elevation_m: 4.8, total_capacity: 20000, current_occupancy: 11500, supplies_status: "LOW", medical_unit_onsite: true },
    { id: "shelter_4", name: "Harbor Bay Community Center", zone_id: "zone_harbor_bay", lat: 25.7700, lng: -80.1810, elevation_m: 1.3, total_capacity: 6000, current_occupancy: 5200, supplies_status: "CRITICAL", medical_unit_onsite: false }
  ];

  let overcrowdedCount = 0;
  const processedShelters = rawShelters.map(s => {
    const sZone = processedZones.find(z => z.id === s.zone_id);
    const evacMult = 1.0 + ((sZone?.risk_score || 0) / 100) * 1.8 * density;
    const occ = Math.round(s.current_occupancy * evacMult);
    const occPct = Math.round((occ / s.total_capacity) * 1000) / 10;

    let status = "OPERATIONAL";
    if ((sZone?.current_water_level_m || 0) >= 0.8) status = "SUBMERGED_EVACUATE";
    else if (occPct >= 100) {
      status = "OVERCROWDED";
      overcrowdedCount++;
    } else if (occPct >= 85) status = "NEAR_CAPACITY";

    return {
      ...s,
      current_occupancy: occ,
      occupancy_pct: occPct,
      status: status
    };
  });

  const maxRisk = Math.max(...processedZones.map(z => z.risk_score));
  let threat = "LOW";
  if (maxRisk >= 80 || isolatedCount >= 2) threat = "CATASTROPHIC";
  else if (maxRisk >= 55 || submergedRoadsKm >= 6.0) threat = "SEVERE";
  else if (maxRisk >= 25) threat = "ELEVATED";

  const evacRoutes = [
    {
      id: "route_harbor_to_ridge",
      origin_zone_id: "zone_harbor_bay",
      origin_zone_name: "Harbor Bay Coastal District",
      target_shelter_id: "shelter_1",
      target_shelter_name: "North Ridge Arena Refuge",
      path_road_ids: ["road_1", "road_4"],
      waypoints: [[25.7725, -80.1840], [25.7950, -80.1900], [25.8200, -80.2025], [25.8220, -80.2050]],
      total_distance_km: 7.7,
      estimated_travel_time_min: 24.5,
      safety_rating: maxRisk > 70 ? "HAZARDOUS" : "MODERATE_RISK"
    },
    {
      id: "route_river_to_civic",
      origin_zone_id: "zone_river_delta",
      origin_zone_name: "Riverfront Central Basin",
      target_shelter_id: "shelter_2",
      target_shelter_name: "Eastside Civic Complex",
      path_road_ids: ["road_3", "road_5"],
      waypoints: [[25.7725, -80.2115], [25.7950, -80.1900], [25.8050, -80.1625], [25.8080, -80.1600]],
      total_distance_km: 6.9,
      estimated_travel_time_min: 19.0,
      safety_rating: "SAFE"
    }
  ];

  const hourlyForecast = [0, 3, 6, 12, 18, 24].map(h => ({
    hour: `+${h}h`,
    water_level_m: Math.min(3.5, Math.round(((rain / 40) + (surge * 0.4)) * (1 + h * 0.12) * 100) / 100),
    population_at_risk: Math.round(popAtRisk * Math.min(2.0, 1 + h * 0.08)),
    submerged_roads_km: Math.min(24.5, Math.round(submergedRoadsKm * (1 + h * 0.1) * 10) / 10)
  }));

  return {
    timestamp: new Date().toISOString(),
    parameters: params,
    overall_threat_level: threat,
    total_population_at_risk: popAtRisk,
    total_submerged_roads_km: Math.round(submergedRoadsKm * 100) / 100,
    isolated_zones_count: isolatedCount,
    shelters_overcrowded_count: overcrowdedCount,
    power_substations_down: powerDown,
    zones: processedZones,
    roads: processedRoads,
    shelters: processedShelters,
    medical_units: [
      { id: "med_1", name: "Mobile Rescue Unit Alpha", type: "MOBILE_AMBULANCE", lat: 25.7730, lng: -80.1850, zone_id: "zone_harbor_bay", status: "DISPATCHED" },
      { id: "med_2", name: "Trauma Field Hospital Beta", type: "FIELD_HOSPITAL", lat: 25.8230, lng: -80.2010, zone_id: "zone_north_hills", status: "STATIONED" },
      { id: "med_3", name: "Marine Search Boat Gamma", type: "RESCUE_BOAT", lat: 25.7750, lng: -80.2100, zone_id: "zone_river_delta", status: "DISPATCHED" },
      { id: "med_4", name: "Air Ambulance Evac Delta", type: "AIR_AMBULANCE", lat: 25.8060, lng: -80.1630, zone_id: "zone_east_suburbs", status: "AVAILABLE" }
    ],
    evacuation_routes: evacRoutes,
    alerts: [
      { id: "alt_1", severity: "CRITICAL", title: `Threat Rating: ${threat}`, message: `Simulated rainfall of ${rain}mm/hr with storm surge ${surge}m.` }
    ],
    hourly_forecast: hourlyForecast
  };
}

function getFallbackAIChat(query, state) {
  const threat = state?.overall_threat_level || "SEVERE";
  return {
    reply: `Digital Twin AI Assistant Analysis: Simulated conditions place overall threat at ${threat}. Coastal & riverbed lowlands require immediate traffic rerouting to North Ridge Highland Pass.`,
    suggested_actions: [
      "Issue real-time emergency evacuation notifications to Harbor Bay residents.",
      "Pre-position mobile pumps near Westside Power Substation.",
      "Redirect evacuee transport from overcrowded shelters to North Ridge Arena."
    ],
    priority_zones: ["Harbor Bay Coastal District", "Riverfront Central Basin", "Westside Industrial & Grid"]
  };
}
