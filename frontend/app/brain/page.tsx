"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar
} from 'recharts';
import { Brain, Terminal, Activity, Cpu } from "lucide-react";

export default function HyperChamber() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load Strategies on Mount
  useEffect(() => {
    axios.get("http://localhost:8000/api/strategies")
      .then(res => setStrategies(res.data))
      .catch(err => console.error(err));
  }, []);

  const startTraining = async () => {
    if (!selectedId) return alert("Select a strategy to optimize!");
    
    setIsTraining(true);
    setLogs(["INITIALIZING AI OPTIMIZER...", "INSPECTING CODE STRUCTURE..."]);
    setChartData([]);

    try {
        const response = await fetch(`http://localhost:8000/api/optimize_stream/${selectedId}`);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            lines.forEach(line => {
                try {
                    const data = JSON.parse(line);
                    
                    if (data.log) {
                        setLogs(prev => [...prev.slice(-15), data.log]);
                    }

                    if (data.reward !== undefined) {
                        setChartData(prev => [...prev, { 
                            step: prev.length, 
                            sharpe: data.reward,
                            ...data.params // Add params to data for tooltips
                        }]);
                    }
                } catch (e) {
                    console.error("Parse Error", e);
                }
            });
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    } catch (err) {
        setLogs(prev => [...prev, "CONNECTION ERROR."]);
    } finally {
        setIsTraining(false);
    }
  };

  return (
    <div className="p-8 min-h-screen text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
                HYPER <span className="text-[#00ff9d]">CHAMBER</span> <Brain className="text-[#00ff9d]" />
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm">REAL-TIME PARAMETER OPTIMIZATION</p>
        </div>
        
        <div className="flex gap-4">
            <select 
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
                onChange={(e) => setSelectedId(e.target.value)}
                value={selectedId}
            >
                <option value="">Select Strategy</option>
                {strategies.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            <button 
                onClick={startTraining}
                disabled={isTraining}
                className={`
                    px-6 py-2 rounded-lg font-bold text-black flex items-center gap-2 transition-all
                    ${isTraining ? 'bg-gray-600' : 'bg-[#00ff9d] hover:bg-green-400 shadow-[0_0_20px_#00ff9d]'}
                `}
            >
                <Cpu size={18} /> {isTraining ? "TUNING..." : "OPTIMIZE"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 h-[600px]">
        {/* Left: Terminal */}
        <div className="col-span-5 flex flex-col gap-6">
            <div className="flex-1 glass-panel p-4 rounded-xl font-mono text-xs flex flex-col border border-[#00ff9d]/30 shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-[#00ff9d]">
                    <Terminal size={14} /> OPTIMIZATION LOGS
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 w-full space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`truncate ${log.includes("NEW RECORD") ? "text-[#00ff9d] font-bold" : "text-green-500/80"}`}>
                                <span className="mr-2 text-gray-600">{i}</span>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Charts */}
        <div className="col-span-7 glass-panel p-6 rounded-xl flex flex-col">
            <div className="flex justify-between mb-4">
                <h2 className="font-mono text-gray-400 flex items-center gap-2">
                    <Activity size={16} /> SHARPE RATIO EVOLUTION
                </h2>
                <span className="text-2xl font-bold text-[#00ff9d]">
                    {chartData.length > 0 ? Math.max(...chartData.map(d => d.sharpe)).toFixed(2) : "0.00"}
                </span>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <YAxis stroke="#555" domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sharpe" 
                            stroke="#00ff9d" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#00ff9d' }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}