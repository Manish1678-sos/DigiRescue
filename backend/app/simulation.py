import copy
import math
from datetime import datetime
import networkx as nx
from typing import List, Dict, Any, Tuple

from app.models import (
    EnvironmentalParameters,
    Zone,
    RoadSegment,
    Shelter,
    MedicalUnit,
    EvacuationRoute,
    SimulationResponse,
    AIChatRequest,
    AIChatResponse
)
# Regional data dictionary import (jeta mock_zones.py-te thakbe)
from app.data.mock_zones import (
    REGIONAL_ZONES, 
    REGIONAL_ROADS, 
    REGIONAL_SHELTERS, 
    REGIONAL_MEDICAL_UNITS
)

def run_simulation_cascade(params: EnvironmentalParameters, region_id: str = "miami") -> SimulationResponse:
    # 1. Select region-specific mock states (fallback to 'miami' if region not found)
    target_region = region_id if region_id in REGIONAL_ZONES else "miami"
    
    raw_zones = copy.deepcopy(REGIONAL_ZONES[target_region])
    raw_roads = copy.deepcopy(REGIONAL_ROADS[target_region])
    raw_shelters = copy.deepcopy(REGIONAL_SHELTERS[target_region])
    raw_meds = copy.deepcopy(REGIONAL_MEDICAL_UNITS[target_region])

    zones: List[Zone] = []
    roads: List[RoadSegment] = []
    shelters: List[Shelter] = []
    meds: List[MedicalUnit] = []
    alerts: List[Dict[str, Any]] = []

    time_factor = 1.0 + (params.time_horizon_hrs * 0.15)
    infra_penalty = 1.0 + (params.infrastructure_age / 100.0) * 0.4

    # 2. Calculate Zone water depth, risk scores, power grid status
    total_pop_at_risk = 0
    isolated_zones_count = 0
    power_substations_down = 0

    for z_data in raw_zones:
        elev = z_data["elevation_m"]
        drainage = z_data["drainage_capacity_mm_hr"]
        
        # Rainfall excess water
        rain_excess = max(0.0, params.rainfall_mm_hr - drainage) * 0.015 * time_factor
        
        # Coastal surge impact
        surge_impact = max(0.0, params.storm_surge_m - elev * 0.5) * 0.6
        
        # Dam discharge impact (if applicable to zone category/id)
        dam_impact = 0.0
        if "river" in z_data["id"] or "industrial" in z_data["id"]:
            dam_impact = (params.dam_release_m3s / 1000.0) * 0.45 * time_factor
        
        wind_impact = (params.wind_speed_kmh / 150.0) * 0.2

        water_depth = round(rain_excess + surge_impact + dam_impact + wind_impact, 2)
        submerged_pct = min(100.0, round((water_depth / max(0.5, elev)) * 35.0, 1))
        
        # Risk score calculation
        risk_raw = (
            (water_depth * 28.0) +
            (max(0, 15.0 - elev) * 2.2) +
            (params.wind_speed_kmh * 0.2) +
            ((params.population_density_mult - 1.0) * 15.0)
        ) * infra_penalty

        risk_score = min(100.0, max(0.0, round(risk_raw, 1)))
        
        if risk_score < 25.0:
            risk_level = "LOW"
        elif risk_score < 55.0:
            risk_level = "MODERATE"
        elif risk_score < 80.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        if risk_level in ["HIGH", "CRITICAL"]:
            total_pop_at_risk += int(z_data["population"] * (risk_score / 100.0))

        if water_depth > 0.65 or params.wind_speed_kmh > 110.0 or risk_score > 85.0:
            power_status = "OFFLINE"
            power_substations_down += 1
        elif water_depth > 0.3 or params.wind_speed_kmh > 70.0 or risk_score > 50.0:
            power_status = "DEGRADED"
        else:
            power_status = "ONLINE"

        zone_obj = Zone(
            id=z_data["id"],
            name=z_data["name"],
            category=z_data["category"],
            elevation_m=elev,
            population=z_data["population"],
            area_km2=z_data["area_km2"],
            drainage_capacity_mm_hr=drainage,
            bounds=z_data["bounds"],
            center=z_data["center"],
            current_water_level_m=water_depth,
            risk_score=risk_score,
            risk_level=risk_level,
            is_isolated=False,
            power_grid_status=power_status,
            submerged_area_pct=submerged_pct
        )
        zones.append(zone_obj)

    zone_map = {z.id: z for z in zones}

    # 3. Calculate Road Segment submergence
    total_submerged_roads_km = 0.0
    for r_data in raw_roads:
        if r_data["from_zone_id"] not in zone_map or r_data["to_zone_id"] not in zone_map:
            continue
        from_z = zone_map[r_data["from_zone_id"]]
        to_z = zone_map[r_data["to_zone_id"]]
        avg_zone_water = (from_z.current_water_level_m + to_z.current_water_level_m) / 2.0
        
        road_water = max(0.0, avg_zone_water - (r_data["elevation_m"] * 0.2))
        road_water = round(road_water, 2)

        if r_data["is_bridge"] and (params.wind_speed_kmh > 95.0 or road_water > 0.35):
            status = "IMPASSABLE"
        elif road_water >= 0.5:
            status = "IMPASSABLE"
        elif road_water >= 0.25:
            status = "CAUTION"
        else:
            status = "CLEAR"

        if status != "CLEAR":
            total_submerged_roads_km += r_data["length_km"]

        roads.append(RoadSegment(
            id=r_data["id"],
            name=r_data["name"],
            from_zone_id=r_data["from_zone_id"],
            to_zone_id=r_data["to_zone_id"],
            length_km=r_data["length_km"],
            elevation_m=r_data["elevation_m"],
            coordinates=r_data["coordinates"],
            water_depth_m=road_water,
            status=status,
            is_bridge=r_data["is_bridge"],
            max_throughput_veh_hr=r_data["max_throughput_veh_hr"]
        ))

    # 4. Check Zone Isolation via Graph Connectivity
    G = nx.Graph()
    for z in zones:
        G.add_node(z.id)
    
    for r in roads:
        if r.status != "IMPASSABLE":
            weight = r.length_km * (1.5 if r.status == "CAUTION" else 1.0)
            G.add_edge(r.from_zone_id, r.to_zone_id, weight=weight, road_id=r.id)

    # Safe anchor node (pick the first zone with highest elevation as default safe anchor)
    safe_anchor = max(zones, key=lambda x: x.elevation_m).id if zones else None
    for z in zones:
        if safe_anchor and z.id != safe_anchor:
            if not nx.has_path(G, z.id, safe_anchor):
                z.is_isolated = True
                isolated_zones_count += 1

    # 5. Shelter Occupancy & Overcrowding Logic
    shelters_overcrowded_count = 0
    for s_data in raw_shelters:
        if s_data["zone_id"] not in zone_map:
            continue
        s_zone = zone_map[s_data["zone_id"]]
        surrounding_risk = s_zone.risk_score
        evac_demand_factor = 1.0 + (surrounding_risk / 100.0) * 1.8 * (params.population_density_mult)
        
        simulated_occ = int(s_data["current_occupancy"] * evac_demand_factor)
        occ_pct = round((simulated_occ / s_data["total_capacity"]) * 100.0, 1)

        if s_zone.current_water_level_m >= 0.8:
            shelter_status = "SUBMERGED_EVACUATE"
            supplies = "CRITICAL"
        elif occ_pct >= 100.0:
            shelter_status = "OVERCROWDED"
            shelters_overcrowded_count += 1
            supplies = "CRITICAL" if occ_pct > 120.0 else "LOW"
        elif occ_pct >= 85.0:
            shelter_status = "NEAR_CAPACITY"
            supplies = "LOW"
        else:
            shelter_status = "OPERATIONAL"
            supplies = s_data["supplies_status"]

        shelters.append(Shelter(
            id=s_data["id"],
            name=s_data["name"],
            zone_id=s_data["zone_id"],
            lat=s_data["lat"],
            lng=s_data["lng"],
            elevation_m=s_data["elevation_m"],
            total_capacity=s_data["total_capacity"],
            current_occupancy=simulated_occ,
            occupancy_pct=occ_pct,
            status=shelter_status,
            supplies_status=supplies,
            medical_unit_onsite=s_data["medical_unit_onsite"]
        ))

    # 6. Medical Units Update
    for m_data in raw_meds:
        if m_data["zone_id"] not in zone_map:
            continue
        m_zone = zone_map[m_data["zone_id"]]
        med_status = m_data["status"]
        if m_zone.risk_score > 60.0 and med_status == "STATIONED":
            med_status = "DISPATCHED"
        
        meds.append(MedicalUnit(
            id=m_data["id"],
            name=m_data["name"],
            type=m_data["type"],
            lat=m_data["lat"],
            lng=m_data["lng"],
            zone_id=m_data["zone_id"],
            status=med_status
        ))

    # 7. Compute Dynamic Safe Evacuation Routes (Dijkstra)
    evac_routes: List[EvacuationRoute] = []
    operational_shelters = [s for s in shelters if s.status != "SUBMERGED_EVACUATE"]

    for z in zones:
        if z.risk_score >= 35.0:
            best_path = None
            best_distance = float('inf')
            target_shelter = None

            for s in operational_shelters:
                if nx.has_path(G, z.id, s.zone_id):
                    try:
                        path_nodes = nx.shortest_path(G, z.id, s.zone_id, weight='weight')
                        dist = nx.shortest_path_length(G, z.id, s.zone_id, weight='weight')
                        if dist < best_distance:
                            best_distance = dist
                            best_path = path_nodes
                            target_shelter = s
                    except nx.NetworkXNoPath:
                        continue

            if best_path and target_shelter:
                path_roads = []
                waypoints = [z.center]
                for i in range(len(best_path) - 1):
                    u, v = best_path[i], best_path[i+1]
                    edge_data = G.get_edge_data(u, v)
                    if edge_data:
                        path_roads.append(edge_data['road_id'])
                        matching_r = next((r for r in roads if r.id == edge_data['road_id']), None)
                        if matching_r:
                            waypoints.extend(matching_r.coordinates)
                
                waypoints.append([target_shelter.lat, target_shelter.lng])

                safety = "SAFE"
                if z.risk_score > 70.0:
                    safety = "HAZARDOUS"
                elif z.risk_score > 45.0:
                    safety = "MODERATE_RISK"

                travel_time = round((best_distance / 25.0) * 60.0 + 10.0, 1)

                evac_routes.append(EvacuationRoute(
                    id=f"route_{z.id}_{target_shelter.id}",
                    origin_zone_id=z.id,
                    origin_zone_name=z.name,
                    target_shelter_id=target_shelter.id,
                    target_shelter_name=target_shelter.name,
                    path_road_ids=path_roads,
                    waypoints=waypoints,
                    total_distance_km=round(best_distance, 2),
                    estimated_travel_time_min=travel_time,
                    safety_rating=safety
                ))

    # 8. Threat Level & Alert Generation
    max_risk = max([z.risk_score for z in zones]) if zones else 0.0
    if max_risk >= 80.0 or isolated_zones_count >= 2:
        overall_threat = "CATASTROPHIC"
    elif max_risk >= 60.0 or total_submerged_roads_km >= 6.0:
        overall_threat = "SEVERE"
    elif max_risk >= 35.0:
        overall_threat = "ELEVATED"
    else:
        overall_threat = "LOW"

    if isolated_zones_count > 0:
        alerts.append({
            "id": "alert_iso",
            "severity": "CRITICAL",
            "title": f"{isolated_zones_count} District(s) Physically Isolated",
            "message": "Road/bridge flooding has cut land transport access."
        })
    if shelters_overcrowded_count > 0:
        alerts.append({
            "id": "alert_shelter",
            "severity": "WARNING",
            "title": f"{shelters_overcrowded_count} Shelter(s) Exceeding Capacity",
            "message": "Immediate diversion of evacuees to safer zones recommended."
        })
    if power_substations_down > 0:
        alerts.append({
            "id": "alert_power",
            "severity": "CRITICAL",
            "title": f"{power_substations_down} Power Grid Substation(s) Failure",
            "message": "Submergence or extreme winds triggered automatic grid trip."
        })

    # 9. 24-Hour Forecast Horizon
    hourly_forecast = []
    for h in [0, 3, 6, 12, 18, 24]:
        factor = 1.0 + (h * 0.12)
        sim_water = round(min(3.5, (params.rainfall_mm_hr / 40.0 + params.storm_surge_m * 0.4) * factor), 2)
        sim_pop = int(total_pop_at_risk * min(2.0, (1.0 + h * 0.08)))
        sim_roads = round(min(24.5, total_submerged_roads_km * (1.0 + h * 0.1)), 1)
        hourly_forecast.append({
            "hour": f"+{h}h",
            "water_level_m": sim_water,
            "population_at_risk": sim_pop,
            "submerged_roads_km": sim_roads
        })

    return SimulationResponse(
        timestamp=datetime.now().isoformat(),
        parameters=params,
        overall_threat_level=overall_threat,
        total_population_at_risk=total_pop_at_risk,
        total_submerged_roads_km=round(total_submerged_roads_km, 2),
        isolated_zones_count=isolated_zones_count,
        shelters_overcrowded_count=shelters_overcrowded_count,
        power_substations_down=power_substations_down,
        zones=zones,
        roads=roads,
        shelters=shelters,
        medical_units=meds,
        evacuation_routes=evac_routes,
        alerts=alerts,
        hourly_forecast=hourly_forecast
    )