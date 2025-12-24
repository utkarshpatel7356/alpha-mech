"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beaker, Swords, LayoutDashboard, Brain, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define Props Interface
interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Alpha Lab', icon: Beaker, path: '/lab' },
  { name: 'Arena', icon: Swords, path: '/arena' },
  { name: 'Hyper-Chamber', icon: Brain, path: '/brain' },
  { name: 'Fairness', icon: Brain, path: '/fairness' },
];

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-screen w-64 glass-panel border-r border-gray-800 flex flex-col fixed left-0 top-0 z-50"
        >
          {/* Close Button inside Sidebar */}
          <button 
            onClick={toggle}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="p-8 mt-4">
            <h1 className="text-2xl font-bold tracking-tighter">
              ALPHA<span className="text-[#00ff9d]">MECH</span>
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 shadow-[0_0_15px_rgba(0,255,157,0.1)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-mono text-sm uppercase tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
            </div>
          </div> */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}