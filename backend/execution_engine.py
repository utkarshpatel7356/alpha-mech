import pandas as pd
import importlib.util
import os
import sys
# Make sure we can import BaseStrategy
sys.path.append(os.path.join(os.path.dirname(__file__), "strategies"))
from strategies.base import BaseStrategy

def execute_strategy(strategy_code: str, df: pd.DataFrame):
    """
    1. Writes the code to a temporary file.
    2. Loads it as a module.
    3. Instantiates 'AlphaStrategy'.
    4. Runs the backtest.
    """
    # 1. Save code to a temp file so we can import it
    temp_path = "strategies/temp_strategy.py"
    
    # We need to add the import line for BaseStrategy to the user's code
    # because the VLM usually outputs just the class.
    final_code = "from strategies.base import BaseStrategy\n" + strategy_code
    
    with open(temp_path, "w") as f:
        f.write(final_code)
        
    try:
        # 2. Dynamic Import
        spec = importlib.util.spec_from_file_location("temp_strategy", temp_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # 3. Instantiate
        if not hasattr(module, 'AlphaStrategy'):
            return {"error": "Code must contain class 'AlphaStrategy'"}
            
        strategy_instance = module.AlphaStrategy()
        
        # 4. Run Backtest
        results = strategy_instance.run_backtest(df)
        return results
        
    except Exception as e:
        return {"error": str(e)}