"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar"; // We will modify Sidebar next
import { Menu } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white relative">
      {/* 1. The Sidebar (Controlled Component) */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* 2. The Main Content Area */}
      <motion.main
        // Animate the left margin to push content
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? "16rem" : "0rem" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen relative"
      >
        {/* Toggle Button (Visible only when sidebar is closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Render the actual page content */}
        <div className="p-8">
            {children}
        </div>
      </motion.main>
    </div>
  );
}