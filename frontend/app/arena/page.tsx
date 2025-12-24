"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { Swords, TrendingUp, Activity } from "lucide-react";

export default function Arena() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isFighting, setIsFighting] = useState(false);

  // 1. Load Strategies
  useEffect(() => {
    axios.get("http://localhost:8000/api/strategies")
      .then(res => setStrategies(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Toggle Selection
  const toggleStrategy = (id: number) => {
    if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(s => s !== id));
    } else {
        setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. Run Battle
  const runBattle = async () => {
    if (selectedIds.length === 0) return alert("Select a fighter!");
    setIsFighting(true);
    try {
        const res = await axios.post("http://localhost:8000/api/run_battle", {
            strategy_ids: selectedIds,
            ticker: "AAPL" 
        });
        setChartData(res.data);
    } catch (err) {
        alert("Battle failed.");
    } finally {
        setIsFighting(false);
    }
  };

  // Colors for strategies (Benchmark will always be White/Dashed)
  const colors = ["#00ff9d", "#ff0055", "#00ccff", "#ffaa00", "#bf00ff"];

  // Helper to find final return for the badges
  const getFinalReturn = (key: string) => {
    if (chartData.length === 0) return 0;
    const start = chartData[0][key];
    const end = chartData[chartData.length - 1][key];
    return ((end - start) / start) * 100;
  };

  return (
    <div className="p-8 min-h-screen text-white">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
                BATTLE <span className="text-red-500">ARENA</span> <Swords className="text-red-500" />
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm">
                COMPARING ALGORITHMIC PERFORMANCE AGAINST MARKET BENCHMARKS
            </p>
        </div>
        
        {/* Market Context Badge */}
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end text-[#00ff9d]">
                <Activity size={18} />
                <span className="font-bold tracking-widest">LIVE FEED</span>
            </div>
            <p className="text-2xl font-bold mt-1">AAPL <span className="text-gray-500 text-lg">/ USD</span></p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT: STRATEGY SELECTOR */}
        <div className="col-span-3 space-y-6">
            <div className="glass-panel p-6 rounded-xl">
                <h2 className="font-mono text-gray-400 mb-4 text-xs tracking-widest">AVAILABLE FIGHTERS</h2>
                <div className="space-y-3">
                    {strategies.map((strat: any) => (
                        <div 
                            key={strat.id} 
                            onClick={() => toggleStrategy(strat.id)}
                            className={`
                                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                ${selectedIds.includes(strat.id) 
                                    ? 'bg-[#00ff9d]/10 border-[#00ff9d]' 
                                    : 'bg-white/5 border-white/10 hover:border-white/30'}
                            `}
                        >
                            <div className={`w-3 h-3 rounded-full ${selectedIds.includes(strat.id) ? 'bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]' : 'bg-gray-600'}`} />
                            <span className="font-bold text-sm truncate">{strat.name}</span>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={runBattle}
                    disabled={isFighting}
                    className="w-full mt-6 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    <Swords size={18} /> {isFighting ? "SIMULATING..." : "INITIATE BATTLE"}
                </button>
            </div>

            {/* Battle Stats (Only show after fight) */}
            {chartData.length > 0 && (
                <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-left-4">
                    <h2 className="font-mono text-gray-400 mb-4 text-xs tracking-widest">BATTLE REPORT</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 text-sm">Asset (Benchmark)</span>
                            <span className="font-bold text-white">{getFinalReturn("Benchmark").toFixed(2)}%</span>
                        </div>
                        {selectedIds.map((id) => {
                             const s = strategies.find(x => x.id === id);
                             if(!s) return null;
                             const ret = getFinalReturn(s.name);
                             return (
                                <div key={id} className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{s.name}</span>
                                    <span className={`font-bold ${ret > getFinalReturn("Benchmark") ? 'text-[#00ff9d]' : 'text-red-400'}`}>
                                        {ret > 0 ? "+" : ""}{ret.toFixed(2)}%
                                    </span>
                                </div>
                             )
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT: CHART */}
        <div className="col-span-9 glass-panel p-6 rounded-xl h-[600px] flex flex-col relative">
             {/* Watermark */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-800 text-9xl font-bold opacity-20 pointer-events-none select-none">
                VS
             </div>

             <div className="flex justify-between mb-2 z-10">
                <h2 className="font-mono text-gray-400 flex items-center gap-2">
                    <TrendingUp size={16} /> PERFORMANCE OVER TIME (NORMALIZED BASE 100)
                </h2>
             </div>
             
             <div className="flex-1 w-full min-h-0 z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#555" 
                            tick={{fontSize: 12}} 
                            minTickGap={50}
                            tickFormatter={(val) => val.substring(0,7)} // Show YYYY-MM
                        />
                        <YAxis domain={['auto', 'auto']} stroke="#555" tick={{fontSize: 12}} />
                        
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#888', marginBottom: '8px' }}
                        />
                        
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        {/* 1. The Benchmark Line (Always there) */}
                        <Line 
                            name="Benchmark (Buy & Hold)"
                            type="monotone" 
                            dataKey="Benchmark" 
                            stroke="#ffffff" 
                            strokeWidth={2} 
                            strokeDasharray="5 5" 
                            dot={false}
                            opacity={0.5}
                        />

                        {/* 2. The Strategies */}
                        {chartData.length > 0 && Object.keys(chartData[0])
                            .filter(key => key !== 'date' && key !== 'Benchmark')
                            .map((key, index) => (
                                <Line 
                                    key={key}
                                    name={key} // Used for Legend
                                    type="monotone" 
                                    dataKey={key} 
                                    stroke={colors[index % colors.length]} 
                                    strokeWidth={3} 
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
}