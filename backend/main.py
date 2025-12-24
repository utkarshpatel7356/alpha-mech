# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Create tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Alpha-Mechanism API")

# Allow Frontend to talk to Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js runs here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "online", "system": "Alpha-Mechanism Lite"}

@app.get("/api/status")
def system_status():
    return {
        "latency": "12ms",
        "active_strategies": 0,
        "market_status": "OPEN"
    }