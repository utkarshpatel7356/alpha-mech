import pandas as pd
import numpy as np

class AlphaStrategy(BaseStrategy):
    def __init__(self, short_window: int = 13, long_window: int = 33):
        super().__init__()
        self.short_window = short_window
        self.long_window = long_window

    def generate_signal(self, df: pd.DataFrame) -> int:
        # 1. Need at least 'long_window' days of data
        if len(df) < self.long_window:
            return 0
            
        # 2. Calculate Moving Averages
        # We take the last N values
        short_mavg = df['Close'].tail(self.short_window).mean()
        long_mavg = df['Close'].tail(self.long_window).mean()
        
        # 3. Generate Signal
        if short_mavg > long_mavg:
            return 1  # BUY (Bullish Trend)
        elif short_mavg < long_mavg:
            return -1 # SELL (Bearish Trend)
        else:
            return 0