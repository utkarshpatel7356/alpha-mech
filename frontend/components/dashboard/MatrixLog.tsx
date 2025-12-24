"use client";
import { useEffect, useState, useRef } from "react";

const events = [
  "Initializing Alpha-Mechanism v1.0...",
  "Connected to PostgreSQL Database.",
  "Loaded 3 Strategy Modules.",
  "Market Data Stream: CONNECTED.",
  "Checking Fairness Constraints...",
  "Constraint Satisfied: Lambda=0.5",
  "RL Agent 'PPO-1' ready for optimization.",
  "Scanning for arbitrage opportunities...",
  "Heartbeat: System Healthy.",
];

export default function MatrixLog() {
  const [logs, setLogs] = useState<string[]>(events);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString()}] System scan complete. Latency: ${Math.floor(Math.random() * 20)}ms`;
      setLogs(prev => [...prev.slice(-8), newLog]); // Keep last 8 logs
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 font-mono text-xs h-48 flex flex-col">
      <h3 className="text-gray-500 mb-2 uppercase tracking-widest border-b border-gray-800 pb-1">System Logs</h3>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute bottom-0 w-full space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-green-500/70 border-l-2 border-green-900 pl-2">
              <span className="opacity-50 mr-2">{">"}</span>{log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}