"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [status, setStatus] = useState("Offline");

  useEffect(() => {
    // Check connection to FastAPI
    axios.get("http://localhost:8000/")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("Error: Backend Down"));
  }, []);

  return (
    <main className="min-h-screen p-10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center"
      >
        <h1 className="text-6xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          ALPHA<span className="text-[#00ff9d]">-MECHANISM</span>
        </h1>
        
        <div className="glass-panel p-6 rounded-xl mt-8 max-w-md mx-auto">
          <p className="text-gray-400 uppercase text-xs tracking-widest mb-2">System Status</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`h-3 w-3 rounded-full ${status === "online" ? "bg-green-500 shadow-[0_0_10px_#00ff9d]" : "bg-red-500"}`}></span>
            <span className="text-xl font-mono">{status.toUpperCase()}</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}