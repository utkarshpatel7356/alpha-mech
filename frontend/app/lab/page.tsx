"use client";
import { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import DropZone from "@/components/ui/DropZone";
import { Play, Save, CheckCircle } from "lucide-react";

export default function Lab() {
  // --- STATE ---
  const [code, setCode] = useState("// Upload a paper or start coding...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [lastSavedName, setLastSavedName] = useState("");

  // --- 1. SAVE FUNCTION (New) ---
  const handleSaveStrategy = async () => {
    // Simple prompt for now (we can make a fancy modal later)
    const name = prompt("Enter a name for this strategy:", lastSavedName || "My_Alpha_Strategy");
    
    if (!name) return; // User cancelled

    setIsProcessing(true);
    try {
      await axios.post("http://localhost:8000/api/save_strategy", {
        name: name,
        code: code // Sends whatever is currently in the editor
      });
      
      setLastSavedName(name);
      alert(`✅ Strategy '${name}' saved successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to save strategy.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. BACKTEST FUNCTION ---
  const handleRunBacktest = async () => {
    setIsProcessing(true);
    setResults(null);
    
    try {
      // We send the 'code' state directly. 
      // This means whatever you just EDITED is what gets tested.
      const res = await axios.post("http://localhost:8000/api/run_backtest", {
        code: code,
        ticker: "AAPL" 
      });
      
      if (res.data.error) {
        alert("Error: " + res.data.error);
      } else {
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Backtest failed. Check backend console.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. UPLOAD FUNCTION ---
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/api/upload_paper", formData);
      setCode(res.data.code);
    } catch (err) {
      console.error(err);
      setCode("# ERROR: FAILED TO EXTRACT STRATEGY");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen p-8 text-white relative">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter">
        STRATEGY <span className="text-[#00ff9d]">LAB</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[80vh]">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-xl font-mono mb-4 text-gray-300">INPUT SOURCE</h2>
            <DropZone onFileSelect={handleFileUpload} isProcessing={isProcessing} />
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-xl font-mono mb-4 text-gray-300">CONTROLS</h2>
            <div className="flex gap-4">
                {/* SAVE BUTTON WIRED UP */}
                <button 
                    onClick={handleSaveStrategy}
                    className="flex-1 bg-[#00ff9d] text-black font-bold py-3 rounded-lg hover:bg-green-400 flex items-center justify-center gap-2 transition-colors"
                >
                    <Save size={18} /> SAVE
                </button>
                
                {/* TEST BUTTON */}
                <button 
                    onClick={handleRunBacktest}
                    disabled={isProcessing}
                    className="flex-1 border border-gray-600 hover:border-white hover:bg-white/10 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    <Play size={18} /> {isProcessing ? "BUSY..." : "TEST"}
                </button>
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden border border-gray-800 flex flex-col">
          <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-700 flex justify-between items-center shrink-0">
            <span className="text-xs font-mono text-gray-400">
               {lastSavedName ? `${lastSavedName}.py` : "generated_strategy.py"}
            </span>
            <span className="text-xs text-[#00ff9d] animate-pulse">● LIVE EDITOR</span>
          </div>
          <div className="flex-grow">
            <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
                onChange={(value) => setCode(value || "")}
            />
          </div>
        </div>

        {/* Results Popup */}
        {results && (
            <div className="fixed bottom-10 right-10 p-6 rounded-xl animate-in fade-in slide-in-from-bottom-10 z-50 border border-[#00ff9d]/30 shadow-[0_0_30px_rgba(0,255,157,0.1)] bg-[#0a0a0a] bg-opacity-95 backdrop-blur-xl">
                {/* CHANGE EXPLANATION:
                   - Removed 'glass-panel' (which had high transparency).
                   - Added 'bg-[#0a0a0a]' (almost black).
                   - Added 'bg-opacity-95' (95% opaque, only 5% transparent).
                   - Added 'backdrop-blur-xl' (keeps the cool blur effect behind it).
                */}
                
                <div className="flex justify-between items-center mb-4 gap-4">
                    <h3 className="text-[#00ff9d] font-mono text-xl">BACKTEST COMPLETE</h3>
                    <button onClick={() => setResults(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-8 text-white">
                    <div>
                        <p className="text-gray-400 text-xs tracking-widest uppercase">Total Return</p>
                        <p className={`text-3xl font-bold ${results.total_return_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {results.total_return_pct > 0 ? "+" : ""}{results.total_return_pct}%
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs tracking-widest uppercase">Sharpe Ratio</p>
                        <p className={`text-3xl font-bold ${results.sharpe_ratio >= 1 ? 'text-green-400' : (results.sharpe_ratio > 0 ? 'text-yellow-400' : 'text-red-400')}`}>
                            {results.sharpe_ratio}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}