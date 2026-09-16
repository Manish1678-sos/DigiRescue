# DigiRescue — Digital Twin for Disaster Prediction & Response

> **"What happens if...?"**
> DigiRescue is a digital twin disaster management platform that creates a virtual map-based representation of disaster-prone coastal cities, allowing emergency commanders and policy planners to tweak environmental parameters (rainfall, storm surge, dam releases, wind velocity) and instantly simulate cascading failure consequences on population, roadways, power grids, and shelters.

---

## 🌟 Key Features

1. **Dynamic Cascade Engine**: Real-time hydraulic and elevation risk calculations, modeling district water accumulation, bridge blockages, and power substation trip events.
2. **Interactive Command Map**: Powered by Leaflet & CartoDB Dark Matter tiles, displaying zone flood risk heat polygons, broken road polylines, shelter capacity pins, and dynamic evacuation corridors.
3. **Shortest Safe Path Evacuation**: Integrated Dijkstra network routing avoiding impassable/submerged transport edges.
4. **24-Hour Predictive Time Scrubber**: Scrub forward in time ($t = 0\text{h}$ to $+24\text{h}$) to forecast water rise and population displacement.
5. **Tactical AI Emergency Assistant**: Integrated chatbot drawer providing natural-language situation reports, quick action prompt chips, and operational recommendations.

---

## 📂 Architecture

```text
digirescues/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint & CORS setup
│   │   ├── simulation.py         # NetworkX cascade engine & Dijkstra routing
│   │   ├── models.py             # Pydantic data schemas
│   │   └── data/
│   │       └── mock_zones.py     # GeoJSON coordinates, zones, roads, shelters
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/                   # Static icons & favicons
│   ├── src/
│   │   ├── assets/               # Tailwind & glassmorphism CSS
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Telemetry hero cards & global alert banner
│   │   │   ├── MapView.jsx       # Leaflet map with CartoDB dark tiles
│   │   │   ├── SimulationPanel.jsx# Sliders for rainfall, surge, wind, & scrubber
│   │   │   ├── ResourceList.jsx  # Shelters, dynamic routes, medical units
│   │   │   └── AIAssistant.jsx   # Natural-language AI drawer
│   │   ├── services/
│   │   │   └── api.js            # Axios client with offline fallback
│   │   ├── App.jsx               # Main React state holder
│   │   └── main.jsx              # React mount entry
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: Local Development

#### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*API docs available at: `http://localhost:8000/docs`*

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Web dashboard available at: `http://localhost:3000`*

---

### Option 2: Docker Compose

```bash
docker-compose up --build
```
