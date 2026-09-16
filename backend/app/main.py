from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.models import EnvironmentalParameters, SimulationResponse, AIChatRequest, AIChatResponse
from app.simulation import run_simulation_cascade, handle_ai_query

app = FastAPI(
    title="DigiRescue Digital Twin Backend",
    description="Disaster Management & Cascade Simulation Engine API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok", "service": "DigiRescue Engine", "version": "1.0.0"}

@app.get("/api/initial-state", response_model=SimulationResponse)
def get_initial_state():
    """Returns baseline simulation with default environmental parameters."""
    default_params = EnvironmentalParameters()
    return run_simulation_cascade(default_params)

@app.post("/api/simulate", response_model=SimulationResponse)
def run_simulation(params: EnvironmentalParameters):
    """Executes 'what-if' disaster simulation cascade based on modified parameters."""
    try:
        return run_simulation_cascade(params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation calculation failed: {str(e)}")

@app.post("/api/ai/chat", response_model=AIChatResponse)
def ai_assistant_chat(req: AIChatRequest):
    """Natural-language tactical advice & emergency response generator."""
    try:
        return handle_ai_query(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI query failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
