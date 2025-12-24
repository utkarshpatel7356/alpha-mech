from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import yfinance as yf
from pydantic import BaseModel

# Internal Modules
from database import engine, Base, get_db
from models import Strategy
from vlm_engine import extract_code_from_pdf
from execution_engine import execute_strategy
from rl_brain import optimize_strategy  # <--- NEW IMPORT
# from mab_logic import FairMultiArmedBandit

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Alpha-Mechanism API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StrategySaveRequest(BaseModel):
    name: str
    code: str

class BattleRequest(BaseModel):
    strategy_ids: List[int]
    ticker: str = "AAPL"

class BacktestRequest(BaseModel):
    code: str
    ticker: str = "AAPL"

class AllocationRequest(BaseModel):
    fairness_score: int

# --- API ENDPOINTS ---

@app.get("/")
def health_check():
    return {"status": "online", "system": "Alpha-Mechanism v1.0"}

# 1. UPLOAD & SAVE
@app.post("/api/upload_paper")
async def upload_paper(file: UploadFile = File(...)):
    try:
        content = await file.read()
        generated_code = extract_code_from_pdf(content)
        return {"status": "success", "code": generated_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save_strategy")
async def save_strategy(request: StrategySaveRequest, db: Session = Depends(get_db)):
    try:
        safe_name = request.name.replace(" ", "_").replace(".py", "")
        filename = f"{safe_name}.py"
        file_path = f"strategies/{filename}"
        
        with open(file_path, "w") as f:
            f.write(request.code)
            
        existing = db.query(Strategy).filter(Strategy.name == safe_name).first()
        if existing:
            existing.code = request.code
        else:
            new_strat = Strategy(name=safe_name, filename=filename, code=request.code)
            db.add(new_strat)
        
        db.commit()
        return {"status": "success", "message": "Strategy saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strategies")
def get_strategies(db: Session = Depends(get_db)):
    return db.query(Strategy).all()

# 2. EXECUTION & BATTLE
@app.post("/api/run_backtest")
async def run_backtest_endpoint(request: BacktestRequest):
    df = yf.download(request.ticker, period="2y", interval="1d")
    if df.empty: return {"error": "No market data"}
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)
    
    return execute_strategy(request.code, df)

@app.post("/api/run_battle")
async def run_battle_endpoint(request: BattleRequest, db: Session = Depends(get_db)):
    df = yf.download(request.ticker, period="1y", interval="1d")
    if df.empty: raise HTTPException(status_code=400, detail="No data")
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)
    
    # Benchmark
    df['Market_Return'] = df['Close'].pct_change().fillna(0)
    df['Benchmark'] = (1 + df['Market_Return']).cumprod() * 100
    dates = df.index.strftime('%Y-%m-%d').tolist()
    
    master_data = [{"date": d, "Benchmark": round(df['Benchmark'].iloc[i], 2)} for i, d in enumerate(dates)]

    for strat_id in request.strategy_ids:
        strategy_record = db.query(Strategy).filter(Strategy.id == strat_id).first()
        if not strategy_record: continue
            
        result = execute_strategy(strategy_record.code, df.copy())
        if "error" in result: continue
            
        equity_curve = result["equity_curve"]
        safe_name = strategy_record.name
        for i, val in enumerate(equity_curve):
            if i < len(master_data):
                master_data[i][safe_name] = round(val * 100, 2)

    return master_data

# 3. RL OPTIMIZER (REAL)
@app.get("/api/optimize_stream/{strategy_id}")
async def optimize_stream_endpoint(strategy_id: int, db: Session = Depends(get_db)):
    strategy_record = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy_record:
        raise HTTPException(status_code=404, detail="Strategy not found")
        
    df = yf.download("AAPL", period="1y", interval="1d")
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    return StreamingResponse(
        optimize_strategy(strategy_record.code, df), 
        media_type="application/x-ndjson"
    )

# 4. FAIRNESS MAB
# mab_system = FairMultiArmedBandit(n_arms=3)
# # Pre-train
# mab_system.update(0, 1)
# mab_system.update(0, 1)
# mab_system.update(1, 1)
# mab_system.update(1, 0)
# mab_system.update(2, 0)

# @app.post("/api/allocate_capital")
# async def allocate_capital(request: AllocationRequest):
#     weights = mab_system.calculate_allocation(request.fairness_score)
#     response_data = [
#         {"name": "High Frequency", "value": round(weights[0] * 100, 1), "fill": "#ff0055"},
#         {"name": "Mean Reversion", "value": round(weights[1] * 100, 1), "fill": "#00ccff"},
#         {"name": "Long Term", "value": round(weights[2] * 100, 1), "fill": "#00ff9d"},
#     ]
#     regret_index = request.fairness_score * 0.8 + (3.5) # Simple calc
#     return {"allocation": response_data, "regret_index": round(regret_index, 1)}