"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Scale, Flame, AlertTriangle, ShieldCheck } from "lucide-react";

export default function FairnessConsole() {
  const [fairnessScore, setFairnessScore] = useState(50);
  const [data, setData] = useState<any[]>([]);
  const [regret, setRegret] = useState(0);

  // Function to fetch allocation from backend
  const updateAllocation = async (score: number) => {
    try {
        const res = await axios.post("http://localhost:8000/api/allocate_capital", {
            fairness_score: score
        });
        setData(res.data.allocation);
        setRegret(res.data.regret_index);
    } catch (err) {
        console.error(err);
    }
  };

  // Update when slider changes (with a tiny delay to prevent API spam)
  useEffect(() => {
    const timer = setTimeout(() => {
        updateAllocation(fairnessScore);
    }, 50); 
    return () => clearTimeout(timer);
  }, [fairnessScore]);

  return (
    <div className="p-8 min-h-screen text-white flex flex-col items-center">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter flex items-center justify-center gap-4">
            THE <span className="text-[#00ccff]">JUDGE</span> <Scale className="text-[#00ccff]" size={40} />
        </h1>
        <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest">MULTI-ARMED BANDIT RESOURCE ALLOCATOR</p>
      </div>

      {/* MAIN CONTROL PANEL */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: SLIDER & EXPLANATION */}
        <div className="space-y-8">
            <div className="glass-panel p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <div className="flex justify-between mb-6 font-bold text-lg">
                    <span className="flex items-center gap-2 text-red-500"><Flame size={20}/> PURE GREED</span>
                    <span className="flex items-center gap-2 text-[#00ccff]"><ShieldCheck size={20}/> MAX FAIRNESS</span>
                </div>
                
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={fairnessScore} 
                    onChange={(e) => setFairnessScore(parseInt(e.target.value))}
                    className="w-full h-4 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00ccff] hover:accent-white transition-all"
                />
                
                <div className="mt-8 text-center flex flex-col items-center">
                    <span className="text-7xl font-bold text-white tracking-tighter">{fairnessScore}%</span>
                    <p className="text-gray-400 text-xs tracking-widest mt-2 uppercase bg-white/5 px-4 py-1 rounded-full">Fairness Penalty Constraint</p>
                </div>
            </div>

            {/* Regret Meter */}
            <div className="glass-panel p-6 rounded-xl flex items-center gap-6 border-l-4 border-l-yellow-500">
                <div className={`p-4 rounded-full ${regret > 50 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} transition-colors`}>
                    <AlertTriangle size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">System Regret (Opportunity Cost)</h3>
                    <div className="flex justify-between items-end mb-2">
                         <div className="text-3xl font-bold">{regret}%</div>
                         <div className="text-xs text-gray-500">How much profit we sacrificed</div>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${regret > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${Math.min(regret, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: PIE CHART */}
        <div className="h-[450px] relative glass-panel rounded-3xl border border-gray-800 flex items-center justify-center p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={160}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        animationDuration={600}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '10px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute text-center pointer-events-none animate-in fade-in zoom-in duration-700">
                <p className="text-gray-500 text-xs tracking-widest mb-1">CAPITAL</p>
                <p className="text-2xl font-bold text-white">ALLOCATION</p>
            </div>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="mt-16 text-center max-w-2xl text-gray-500 text-sm p-6 border-t border-gray-800">
        <p className="italic">
            "We mathematically constrain the bandit algorithm to ensure diverse exploration, preventing the system from prematurely converging on a locally optimal strategy."
        </p>
        <p className="mt-2 text-xs font-mono text-[#00ccff]">— BASED ON RESEARCH</p>
      </div>

    </div>
  );
}