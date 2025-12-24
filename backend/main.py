# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from fastapi import UploadFile, File, HTTPException
from vlm_engine import extract_code_from_pdf
import os
# Add these imports
from execution_engine import execute_strategy
import yfinance as yf
from pydantic import BaseModel
import pandas as pd
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from models import Strategy


class StrategySaveRequest(BaseModel):
    name: str
    code: str

class BacktestRequest(BaseModel):
    code: str
    ticker: str = "AAPL" # Default to Apple


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
@app.post("/api/upload_paper")
async def upload_paper(file: UploadFile = File(...)):
    try:
        # Read the file
        content = await file.read()
        
        # Run the VLM Engine
        generated_code = extract_code_from_pdf(content)
        
        # Save to file (Strategy Genome)
        strategy_name = file.filename.replace(".pdf", ".py").replace(" ", "_")
        save_path = f"strategies/{strategy_name}"
        
        with open(save_path, "w") as f:
            f.write(generated_code)
            
        return {"status": "success", "code": generated_code, "filename": strategy_name}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/run_backtest")
async def run_backtest_endpoint(request: BacktestRequest):
    # 1. Fetch Real Data (Last 2 years)
    print(f"Fetching data for {request.ticker}...")
    df = yf.download(request.ticker, period="2y", interval="1d")
    
    if df.empty:
        return {"error": "Could not fetch market data"}
    
    # Clean data (yfinance sometimes returns MultiIndex columns)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    
    # 2. Run the Engine
    results = execute_strategy(request.code, df)
    
    return results

@app.post("/api/save_strategy")
async def save_strategy(request: StrategySaveRequest, db: Session = Depends(get_db)):
    try:
        # 1. Save file to disk (Keep this logic)
        safe_name = request.name.replace(" ", "_").replace(".py", "")
        filename = f"{safe_name}.py"
        file_path = f"strategies/{filename}"
        
        with open(file_path, "w") as f:
            f.write(request.code)
            
        # 2. SAVE TO DB (New Logic)
        # Check if exists to update, else create
        existing = db.query(Strategy).filter(Strategy.name == safe_name).first()
        if existing:
            existing.code = request.code
        else:
            new_strat = Strategy(name=safe_name, filename=filename, code=request.code)
            db.add(new_strat)
        
        db.commit()
        
        return {"status": "success", "message": "Strategy saved to Genome Database"}
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/strategies")
def get_strategies(db: Session = Depends(get_db)):
    return db.query(Strategy).all()