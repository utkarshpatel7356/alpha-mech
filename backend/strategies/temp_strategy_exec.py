from strategies.base import BaseStrategy
import pandas as pd
import numpy as np

class AlphaStrategy(BaseStrategy):
    def __init__(self, period: int = 14, buy_threshold: int = 30, sell_threshold: int = 70):
        super().__init__()
        self.period = period
        self.buy_threshold = buy_threshold
        self.sell_threshold = sell_threshold

    def generate_signal(self, df: pd.DataFrame) -> int:
        if len(df) < self.period + 1:
            return 0
            
        # 1. Calculate RSI manually
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).tail(self.period).mean()
        loss = (-delta.where(delta < 0, 0)).tail(self.period).mean()

        if loss == 0:
            rsi = 100
        else:
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
        # 2. Logic
        if rsi < self.buy_threshold:
            return 1  # Oversold -> Buy the dip
        elif rsi > self.sell_threshold:
            return -1 # Overbought -> Sell the top
        
        # 3. Hold previous position if between 30 and 70
        # Returning 0 in our BaseStrategy means "Close Position" usually, 
        # but for simplicity here we just return 0 (Flat).
        return 0