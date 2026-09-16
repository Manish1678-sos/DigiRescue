# app/data/spatial_data.py

REGIONAL_SPATIAL_DATA = {
    "miami": {
        "zones": [
            {
                "id": "zone_harbor_bay",
                "name": "Harbor Bay Coastal District",
                "category": "Coastal Lowland",
                "elevation_m": 1.2,
                "population": 42000,
                "area_km2": 8.5,
                "drainage_capacity_mm_hr": 20.0,
                "bounds": [
                    [25.7850, -80.1980],
                    [25.7850, -80.1700],
                    [25.7600, -80.1700],
                    [25.7600, -80.1980]
                ],
                "center": [25.7725, -80.1840]
            },
            {
                "id": "zone_river_delta",
                "name": "Riverfront Central Basin",
                "category": "Riverbed Delta",
                "elevation_m": 2.1,
                "population": 65000,
                "area_km2": 11.2,
                "drainage_capacity_mm_hr": 25.0,
                "bounds": [
                    [25.7850, -80.2250],
                    [25.7850, -80.1980],
                    [25.7600, -80.1980],
                    [25.7600, -80.2250]
                ],
                "center": [25.7725, -80.2115]
            },
            {
                "id": "zone_downtown",
                "name": "Downtown Commercial Hub",
                "category": "Urban Dense Core",
                "elevation_m": 4.5,
                "population": 88000,
                "area_km2": 6.8,
                "drainage_capacity_mm_hr": 35.0,
                "bounds": [
                    [25.8050, -80.2050],
                    [25.8050, -80.1750],
                    [25.7850, -80.1750],
                    [25.7850, -80.2050]
                ],
                "center": [25.7950, -80.1900]
            },
            {
                "id": "zone_west_industrial",
                "name": "Westside Industrial & Grid",
                "category": "Industrial & Substation",
                "elevation_m": 1.8,
                "population": 18000,
                "area_km2": 14.0,
                "drainage_capacity_mm_hr": 15.0,
                "bounds": [
                    [25.8050, -80.2500],
                    [25.8050, -80.2050],
                    [25.7850, -80.2050],
                    [25.7850, -80.2500]
                ],
                "center": [25.7950, -80.2275]
            },
            {
                "id": "zone_east_suburbs",
                "name": "East Coastal Heights",
                "category": "Elevated Suburbs",
                "elevation_m": 8.5,
                "population": 54000,
                "area_km2": 9.6,
                "drainage_capacity_mm_hr": 45.0,
                "bounds": [
                    [25.8250, -80.1750],
                    [25.8250, -80.1500],
                    [25.7850, -80.1500],
                    [25.7850, -80.1750]
                ],
                "center": [25.8050, -80.1625]
            },
            {
                "id": "zone_north_hills",
                "name": "North Ridge High Ground",
                "category": "Highland Refuge",
                "elevation_m": 18.2,
                "population": 30000,
                "area_km2": 16.5,
                "drainage_capacity_mm_hr": 60.0,
                "bounds": [
                    [25.8350, -80.2300],
                    [25.8350, -80.1750],
                    [25.8050, -80.1750],
                    [25.8050, -80.2300]
                ],
                "center": [25.8200, -80.2025]
            }
        ],
        "roads": [
            {
                "id": "road_1",
                "name": "Harbor Bay Highway",
                "from_zone_id": "zone_harbor_bay",
                "to_zone_id": "zone_downtown",
                "length_km": 3.2,
                "elevation_m": 1.5,
                "is_bridge": False,
                "max_throughput_veh_hr": 2500,
                "coordinates": [
                    [25.7725, -80.1840],
                    [25.7820, -80.1870],
                    [25.7950, -80.1900]
                ]
            },
            {
                "id": "road_2",
                "name": "River Delta Bridge Expressway",
                "from_zone_id": "zone_river_delta",
                "to_zone_id": "zone_west_industrial",
                "length_km": 2.8,
                "elevation_m": 1.2,
                "is_bridge": True,
                "max_throughput_veh_hr": 1800,
                "coordinates": [
                    [25.7725, -80.2115],
                    [25.7840, -80.2200],
                    [25.7950, -80.2275]
                ]
            },
            {
                "id": "road_3",
                "name": "Central Metro Arterial",
                "from_zone_id": "zone_river_delta",
                "to_zone_id": "zone_downtown",
                "length_km": 3.1,
                "elevation_m": 3.2,
                "is_bridge": False,
                "max_throughput_veh_hr": 3200,
                "coordinates": [
                    [25.7725, -80.2115],
                    [25.7850, -80.2000],
                    [25.7950, -80.1900]
                ]
            },
            {
                "id": "road_4",
                "name": "North Ridge Highland Pass",
                "from_zone_id": "zone_downtown",
                "to_zone_id": "zone_north_hills",
                "length_km": 4.5,
                "elevation_m": 9.5,
                "is_bridge": False,
                "max_throughput_veh_hr": 2000,
                "coordinates": [
                    [25.7950, -80.1900],
                    [25.8080, -80.1950],
                    [25.8200, -80.2025]
                ]
            },
            {
                "id": "road_5",
                "name": "Eastside Coastal Causeway",
                "from_zone_id": "zone_downtown",
                "to_zone_id": "zone_east_suburbs",
                "length_km": 3.8,
                "elevation_m": 5.0,
                "is_bridge": True,
                "max_throughput_veh_hr": 2800,
                "coordinates": [
                    [25.7950, -80.1900],
                    [25.8000, -80.1750],
                    [25.8050, -80.1625]
                ]
            },
            {
                "id": "road_6",
                "name": "West Industrial Ridge Link",
                "from_zone_id": "zone_west_industrial",
                "to_zone_id": "zone_north_hills",
                "length_km": 4.2,
                "elevation_m": 6.0,
                "is_bridge": False,
                "max_throughput_veh_hr": 1500,
                "coordinates": [
                    [25.7950, -80.2275],
                    [25.8100, -80.2150],
                    [25.8200, -80.2025]
                ]
            },
            {
                "id": "road_7",
                "name": "Harbor Delta Connector",
                "from_zone_id": "zone_harbor_bay",
                "to_zone_id": "zone_river_delta",
                "length_km": 2.5,
                "elevation_m": 1.1,
                "is_bridge": False,
                "max_throughput_veh_hr": 1600,
                "coordinates": [
                    [25.7725, -80.1840],
                    [25.7725, -80.1980],
                    [25.7725, -80.2115]
                ]
            }
        ],
        "shelters": [
            {
                "id": "shelter_1",
                "name": "North Ridge Arena Refuge",
                "zone_id": "zone_north_hills",
                "lat": 25.8220,
                "lng": -80.2050,
                "elevation_m": 19.5,
                "total_capacity": 15000,
                "current_occupancy": 3200,
                "supplies_status": "ADEQUATE",
                "medical_unit_onsite": True
            },
            {
                "id": "shelter_2",
                "name": "Eastside Civic Complex",
                "zone_id": "zone_east_suburbs",
                "lat": 25.8080,
                "lng": -80.1600,
                "elevation_m": 9.0,
                "total_capacity": 12000,
                "current_occupancy": 4100,
                "supplies_status": "ADEQUATE",
                "medical_unit_onsite": True
            },
            {
                "id": "shelter_3",
                "name": "Metro Stadium Hub",
                "zone_id": "zone_downtown",
                "lat": 25.7970,
                "lng": -80.1880,
                "elevation_m": 4.8,
                "total_capacity": 20000,
                "current_occupancy": 11500,
                "supplies_status": "LOW",
                "medical_unit_onsite": True
            },
            {
                "id": "shelter_4",
                "name": "Harbor Bay Community Center",
                "zone_id": "zone_harbor_bay",
                "lat": 25.7700,
                "lng": -80.1810,
                "elevation_m": 1.3,
                "total_capacity": 6000,
                "current_occupancy": 5200,
                "supplies_status": "CRITICAL",
                "medical_unit_onsite": False
            }
        ],
        "medical_units": [
            {
                "id": "med_1",
                "name": "Mobile Rescue Unit Alpha",
                "type": "MOBILE_AMBULANCE",
                "lat": 25.7730,
                "lng": -80.1850,
                "zone_id": "zone_harbor_bay",
                "status": "DISPATCHED"
            },
            {
                "id": "med_2",
                "name": "Trauma Field Hospital Beta",
                "type": "FIELD_HOSPITAL",
                "lat": 25.8230,
                "lng": -80.2010,
                "zone_id": "zone_north_hills",
                "status": "STATIONED"
            },
            {
                "id": "med_3",
                "name": "Marine Search Boat Gamma",
                "type": "RESCUE_BOAT",
                "lat": 25.7750,
                "lng": -80.2100,
                "zone_id": "zone_river_delta",
                "status": "DISPATCHED"
            },
            {
                "id": "med_4",
                "name": "Air Ambulance Evac Delta",
                "type": "AIR_AMBULANCE",
                "lat": 25.8060,
                "lng": -80.1630,
                "zone_id": "zone_east_suburbs",
                "status": "AVAILABLE"
            }
        ]
    },
    "kolkata": {
        "zones": [
            # Kolkata data pore add korte paren ba same structure copy kore coordinate change korte paren
        ]
    }
}

def get_spatial_data(region_id: str = "miami"):
    return REGIONAL_SPATIAL_DATA.get(region_id, REGIONAL_SPATIAL_DATA["miami"])