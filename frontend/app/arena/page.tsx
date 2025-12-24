"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Swords } from "lucide-react";

export default function Arena() {
  const [strategies, setStrategies] = useState([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chartData, setChartData] = useState([]);

  // 1. Load Strategies from DB
  useEffect(() => {
    axios.get("http://localhost:8000/api/strategies")
      .then(res => setStrategies(res.data))
      .catch(err => console.error(err));
  }, []);

  // 2. Mock "Battle" Function (Real one would fetch daily equity from backend)
  const runBattle = () => {
    // Generate fake data for visual demo (replace with real backend data later)
    const data = [];
    let valA = 100, valB = 100;
    for(let i=0; i<30; i++) {
        valA = valA * (1 + (Math.random() * 0.1 - 0.04));
        valB = valB * (1 + (Math.random() * 0.1 - 0.04));
        data.push({ day: i, StratA: valA, StratB: valB });
    }
    setChartData(data);
  };

  return (
    <div className="p-10 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter flex items-center gap-4">
        BATTLE <span className="text-red-500">ARENA</span> <Swords className="text-red-500" />
      </h1>

      <div className="grid grid-cols-12 gap-8">
        {/* Strategy Selector */}
        <div className="col-span-3 glass-panel p-6 rounded-xl h-fit">
            <h2 className="font-mono text-gray-400 mb-4">SELECT FIGHTERS</h2>
            <div className="space-y-3">
                {strategies.map((strat: any) => (
                    <div key={strat.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-[#00ff9d] cursor-pointer">
                        <input type="checkbox" className="accent-[#00ff9d] h-5 w-5" />
                        <span className="font-bold">{strat.name}</span>
                    </div>
                ))}
            </div>
            <button 
                onClick={runBattle}
                className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
                <Swords size={18} /> FIGHT
            </button>
        </div>

        {/* The Battle Chart */}
        <div className="col-span-9 glass-panel p-6 rounded-xl h-[600px]">
             <h2 className="font-mono text-gray-400 mb-4">LIVE SIMULATION</h2>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis domain={['auto', 'auto']} stroke="#666" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                    />
                    <Line type="monotone" dataKey="StratA" stroke="#00ff9d" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="StratB" stroke="#ff0055" strokeWidth={3} dot={false} />
                </LineChart>
             </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}