import pandas as pd
import importlib.util
import os
import sys
# Make sure we can import BaseStrategy
sys.path.append(os.path.join(os.path.dirname(__file__), "strategies"))
from strategies.base import BaseStrategy

def execute_strategy(strategy_code: str, df: pd.DataFrame, params: dict = None):
    """
    Runs the strategy with OPTIONAL custom parameters (for RL tuning).
    """
    temp_path = "strategies/temp_strategy_exec.py"
    
    # 1. Write Code
    final_code = "from strategies.base import BaseStrategy\n" + strategy_code
    with open(temp_path, "w") as f:
        f.write(final_code)
        
    try:
        # 2. Import Module
        spec = importlib.util.spec_from_file_location("temp_strategy_exec", temp_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        if not hasattr(module, 'AlphaStrategy'):
            return {"error": "Class 'AlphaStrategy' not found"}
            
        # 3. Instantiate with Custom Params (The Magic Step)
        if params:
            # We unpack the dictionary: AlphaStrategy(short_window=12, long_window=30)
            strategy_instance = module.AlphaStrategy(**params)
        else:
            strategy_instance = module.AlphaStrategy()
        
        # 4. Run Backtest
        results = strategy_instance.run_backtest(df)
        return results
        
    except Exception as e:
        return {"error": str(e)}