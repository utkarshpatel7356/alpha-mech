from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from database import Base
from datetime import datetime

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    filename = Column(String) # e.g., "Momentum_V1.py"
    code = Column(String)     # The actual python code
    created_at = Column(DateTime, default=datetime.utcnow)
    sharpe_ratio = Column(Float, nullable=True) # Best recorded sharpe
    
class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer)
    symbol = Column(String)
    action = Column(String) # BUY/SELL
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    