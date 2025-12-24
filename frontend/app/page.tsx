"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, DollarSign, Cpu, Zap, Layers } from "lucide-react";
import AssetTicker from "@/components/dashboard/AssetTicker";
import MatrixLog from "@/components/dashboard/MatrixLog";

// Mock Data for the Main "Equity" Chart
const equityData = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  value: 100000 * Math.pow(1.01, i) + (Math.random() * 5000)
}));

export default function Dashboard() {
  const [strategies, setStrategies] = useState<any[]>([]);

  // Fetch strategy count for the "Active Bots" card
  useEffect(() => {
    axios.get("http://localhost:8000/api/strategies")
      .then(res => setStrategies(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-16"> {/* pt-16 for Ticker space */}
      <AssetTicker />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* 1. WELCOME SECTION */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-bold tracking-tighter">
                    COMMAND <span className="text-[#00ff9d]">CENTER</span>
                </h1>
                <p className="text-gray-400 mt-1 font-mono text-sm">PORTFOLIO OVERVIEW & SYSTEM HEALTH</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
                <span className="text-[#00ff9d] text-xs font-bold tracking-widest">SYSTEM ONLINE</span>
            </div>
        </div>

        {/* 2. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard 
                title="TOTAL EQUITY" 
                value="$142,590.00" 
                change="+12.5%" 
                icon={DollarSign} 
                color="text-[#00ff9d]" 
            />
            <MetricCard 
                title="ACTIVE STRATEGIES" 
                value={strategies.length.toString()} 
                change="Running" 
                icon={Cpu} 
                color="text-blue-400" 
            />
            <MetricCard 
                title="TOTAL ALPHA" 
                value="+4.2%" 
                change="vs Benchmark" 
                icon={Zap} 
                color="text-yellow-400" 
            />
            <MetricCard 
                title="FAIRNESS SCORE" 
                value="98/100" 
                change="Optimized" 
                icon={Layers} 
                color="text-purple-400" 
            />
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid grid-cols-12 gap-8 h-[500px]">
            
            {/* Main Equity Chart */}
            <div className="col-span-8 glass-panel p-6 rounded-xl border border-gray-800 flex flex-col">
                <div className="flex justify-between mb-4">
                    <h2 className="font-mono text-gray-400 flex items-center gap-2">
                        <Activity size={16} /> PORTFOLIO PERFORMANCE
                    </h2>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                                itemStyle={{ color: '#00ff9d' }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#00ff9d" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorValue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right Side: System Logs & Status */}
            <div className="col-span-4 flex flex-col gap-6">
                
                {/* Status Box */}
                <div className="glass-panel p-6 rounded-xl border border-gray-800">
                    <h3 className="text-gray-500 mb-4 uppercase tracking-widest text-xs">Infrastructure</h3>
                    <div className="space-y-4">
                        <StatusRow label="FastAPI Backend" status="Operational" />
                        <StatusRow label="PostgreSQL DB" status="Operational" />
                        <StatusRow label="Gemini VLM" status="Connected" />
                        <StatusRow label="Execution Engine" status="Idle" />
                    </div>
                </div>

                {/* Matrix Log Component */}
                <MatrixLog />
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function MetricCard({ title, value, change, icon: Icon, color }: any) {
    return (
        <div className="glass-panel p-6 rounded-xl border border-gray-800 hover:border-[#00ff9d]/50 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-xs font-mono tracking-widest">{title}</span>
                <Icon size={20} className={`${color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className={`text-xs ${change.includes("+") ? "text-green-400" : "text-gray-400"}`}>{change}</div>
        </div>
    );
}

function StatusRow({ label, status }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === "Operational" || status === "Connected" ? "bg-green-500" : "bg-yellow-500"}`} />
                <span className="text-gray-500">{status}</span>
            </div>
        </div>
    );
}