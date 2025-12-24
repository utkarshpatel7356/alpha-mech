import pandas as pd
import numpy as np


class AlphaStrategy(BaseStrategy):

    def __init__(self, lookback_period_months: int = 12, trading_days_per_month: int = 21):
        super().__init__()
        self.lookback_period_months = lookback_period_months
        self.trading_days_per_month = trading_days_per_month

    def generate_signal(self, df: pd.DataFrame) -> int:
        if df.empty or 'Close' not in df.columns:
            return 0

        required_observations = self.lookback_period_months * self.trading_days_per_month

        if len(df) < required_observations + 1:
            return 0

        current_price = df['Close'].iloc[-1]
        past_price = df['Close'].iloc[-required_observations - 1]

        if past_price == 0:
            return 0

        momentum_return = (current_price / past_price) - 1

        if momentum_return > 0:
            return 1
        elif momentum_return < 0:
            return -1
        else:
            return 0
