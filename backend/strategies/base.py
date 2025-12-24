import pandas as pd

class BaseStrategy:
    def __init__(self):
        self.position = 0  # Current position (1=Long, -1=Short, 0=Flat)
        
    def generate_signal(self, df: pd.DataFrame) -> int:
        """
        Logic to return 1 (Buy), -1 (Sell), or 0 (Hold).
        Must be overridden by the child class.
        """
        raise NotImplementedError("Strategy must implement generate_signal")

    def run_backtest(self, df: pd.DataFrame):
        """
        Standard Vectorized Backtest.
        Calculates daily returns based on the signal.
        """
        # 1. Generate Signals
        # We apply the signal logic to every row (rolling window style)
        # Note: For speed in this Lite version, we apply it row-by-row or vectorized if possible.
        # This simple loop is safer for complex logic but slower.
        
        signals = []
        for i in range(len(df)):
            # Pass the dataframe up to the current point to prevent lookahead bias
            historical_slice = df.iloc[:i+1]
            try:
                sig = self.generate_signal(historical_slice)
            except Exception:
                sig = 0
            signals.append(sig)
            
        df['Signal'] = signals
        
        # 2. Shift Signal by 1 day (we trade at Open of NEXT day based on Close of TODAY)
        df['Position'] = df['Signal'].shift(1)
        
        # 3. Calculate Strategy Returns
        # Market Return = (Close / PrevClose) - 1
        df['Market_Return'] = df['Close'].pct_change()
        df['Strategy_Return'] = df['Position'] * df['Market_Return']
        
        # 4. Cumulative Returns
        df['Equity_Curve'] = (1 + df['Strategy_Return']).cumprod()
        
        # 5. Calculate Metrics
        total_return = df['Equity_Curve'].iloc[-1] - 1
        sharpe_ratio = df['Strategy_Return'].mean() / df['Strategy_Return'].std() * (252**0.5)
        
        return {
            "sharpe_ratio": round(sharpe_ratio, 2),
            "total_return_pct": round(total_return * 100, 2),
            "equity_curve": df['Equity_Curve'].fillna(1).tolist() # For the chart
        }