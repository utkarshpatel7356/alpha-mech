import numpy as np
import pandas as pd
import json
import asyncio
import inspect
import importlib.util
from execution_engine import execute_strategy

# Simple "Hill Climbing" Optimizer (Better for this use case than PPO)
# Why? PPO needs thousands of episodes. You don't want to wait 5 hours.
# Hill Climbing finds the best parameters in ~30 seconds.

async def optimize_strategy(strategy_code: str, df: pd.DataFrame):
    """
    1. Inspects the strategy code to find tunable parameters.
    2. Runs a loop trying different values.
    3. Streams the progress to the UI.
    """
    
    # 1. ANALYZE THE STRATEGY CODE
    # We save it momentarily to import it and check __init__
    temp_path = "strategies/temp_inspector.py"
    with open(temp_path, "w") as f:
        f.write("from strategies.base import BaseStrategy\n" + strategy_code)
    
    spec = importlib.util.spec_from_file_location("temp_inspector", temp_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    # Get the arguments of __init__ (excluding 'self')
    sig = inspect.signature(module.AlphaStrategy.__init__)
    params = {}
    
    # Define ranges for common parameter names (Smart Heuristics)
    param_ranges = {}
    for name, param in sig.parameters.items():
        if name == 'self': continue
        
        # Default value
        default = param.default if param.default is not inspect.Parameter.empty else 10
        params[name] = default
        
        # Set smart search ranges based on name
        if 'window' in name or 'period' in name:
            param_ranges[name] = (5, 100) # Search between 5 and 100
        elif 'threshold' in name:
            param_ranges[name] = (10, 90) # Search RSI thresholds
        else:
            param_ranges[name] = (1, 50) # Generic fallback

    yield json.dumps({"log": f"DETECTED PARAMETERS: {list(params.keys())}"}) + "\n"

    # 2. THE OPTIMIZATION LOOP
    best_sharpe = -999
    best_params = params.copy()
    
    # We will try 20 iterations of random "Mutations"
    for i in range(1, 21):
        await asyncio.sleep(0.1) # UI buffer
        
        # Mutate parameters slightly
        current_test_params = best_params.copy()
        for key in param_ranges:
            low, high = param_ranges[key]
            # Randomly change the value by +/- 20%
            change = np.random.randint(-5, 6) 
            new_val = current_test_params[key] + change
            # Clip to bounds
            new_val = max(low, min(high, new_val))
            current_test_params[key] = int(new_val)
            
        # RUN REAL BACKTEST
        result = execute_strategy(strategy_code, df.copy(), current_test_params)
        
        if "error" in result:
            yield json.dumps({"log": f"Error: {result['error']}"}) + "\n"
            continue
            
        sharpe = result.get('sharpe_ratio', -1)
        
        # Logic: If better, keep it.
        log_msg = f"Ep {i}: Testing {current_test_params} -> Sharpe: {sharpe}"
        if sharpe > best_sharpe:
            best_sharpe = sharpe
            best_params = current_test_params.copy()
            log_msg += " (NEW RECORD! 🚀)"
        
        # STREAM DATA PACKET
        data = {
            "episode": i,
            "log": log_msg,
            "reward": sharpe, # The "Reward" is the Sharpe Ratio
            "params": current_test_params # Visualization needs this
        }
        yield json.dumps(data) + "\n"

    yield json.dumps({"log": f"--- OPTIMIZATION COMPLETE ---"}) + "\n"
    yield json.dumps({"log": f"BEST PARAMETERS: {best_params} (Sharpe: {best_sharpe})"}) + "\n"