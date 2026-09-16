from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EnvironmentalParameters(BaseModel):
    rainfall_mm_hr: float = Field(default=25.0, ge=0.0, le=200.0, description="Rainfall intensity in mm/hr")
    storm_surge_m: float = Field(default=0.5, ge=0.0, le=5.0, description="Storm surge / tide height in meters")
    dam_release_m3s: float = Field(default=200.0, ge=0.0, le=5000.0, description="Dam discharge in cubic meters per sec")
    wind_speed_kmh: float = Field(default=35.0, ge=0.0, le=150.0, description="Wind speed in km/h")
    infrastructure_age: float = Field(default=30.0, ge=0.0, le=100.0, description="Infrastructure degradation rating (0-100)")
    population_density_mult: float = Field(default=1.0, ge=0.5, le=2.0, description="Population density factor multiplier")
    time_horizon_hrs: float = Field(default=0.0, ge=0.0, le=24.0, description="Simulation prediction time step in hours")

class Zone(BaseModel):
    id: str
    name: str
    category: str
    elevation_m: float
    population: int
    area_km2: float
    drainage_capacity_mm_hr: float
    bounds: List[List[float]]  # polygon coordinates [[lat, lng], ...]
    center: List[float]       # [lat, lng]
    current_water_level_m: float = 0.0
    risk_score: float = 0.0
    risk_level: str = "LOW"
    is_isolated: bool = False
    power_grid_status: str = "ONLINE"
    submerged_area_pct: float = 0.0

class RoadSegment(BaseModel):
    id: str
    name: str
    from_zone_id: str
    to_zone_id: str
    length_km: float
    elevation_m: float
    coordinates: List[List[float]]  # polyline coordinates
    water_depth_m: float = 0.0
    status: str = "CLEAR"  # CLEAR, CAUTION, IMPASSABLE
    is_bridge: bool = False
    max_throughput_veh_hr: int = 1200

class Shelter(BaseModel):
    id: str
    name: str
    zone_id: str
    lat: float
    lng: float
    elevation_m: float
    total_capacity: int
    current_occupancy: int = 0
    occupancy_pct: float = 0.0
    status: str = "OPERATIONAL"  # OPERATIONAL, NEAR_CAPACITY, OVERCROWDED, SUBMERGED_EVACUATE
    supplies_status: str = "ADEQUATE"
    medical_unit_onsite: bool = True

class MedicalUnit(BaseModel):
    id: str
    name: str
    type: str  # MOBILE_AMBULANCE, FIELD_HOSPITAL, RESCUE_BOAT, AIR_AMBULANCE
    lat: float
    lng: float
    zone_id: str
    status: str = "AVAILABLE"  # AVAILABLE, DISPATCHED, STATIONED

class EvacuationRoute(BaseModel):
    id: str
    origin_zone_id: str
    origin_zone_name: str
    target_shelter_id: str
    target_shelter_name: str
    path_road_ids: List[str]
    waypoints: List[List[float]]
    total_distance_km: float
    estimated_travel_time_min: float
    safety_rating: str  # SAFE, MODERATE_RISK, HAZARDOUS

class SimulationResponse(BaseModel):
    timestamp: str
    parameters: EnvironmentalParameters
    overall_threat_level: str  # LOW, ELEVATED, SEVERE, CATASTROPHIC
    total_population_at_risk: int
    total_submerged_roads_km: float
    isolated_zones_count: int
    shelters_overcrowded_count: int
    power_substations_down: int
    zones: List[Zone]
    roads: List[RoadSegment]
    shelters: List[Shelter]
    medical_units: List[MedicalUnit]
    evacuation_routes: List[EvacuationRoute]
    alerts: List[Dict[str, Any]]
    hourly_forecast: List[Dict[str, Any]]

class AIChatRequest(BaseModel):
    query: str
    simulation_state: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    priority_zones: List[str]
