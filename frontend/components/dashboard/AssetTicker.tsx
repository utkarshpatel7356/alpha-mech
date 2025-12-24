"use client";
import Marquee from "react-fast-marquee";
import { TrendingUp, TrendingDown } from "lucide-react";

const assets = [
  { symbol: "BTC", price: "64,230.50", change: "+2.4%", up: true },
  { symbol: "ETH", price: "3,450.10", change: "-1.2%", up: false },
  { symbol: "SOL", price: "145.20", change: "+5.7%", up: true },
  { symbol: "AAPL", price: "182.50", change: "+0.8%", up: true },
  { symbol: "TSLA", price: "175.40", change: "-2.1%", up: false },
  { symbol: "NVDA", price: "890.00", change: "+1.5%", up: true },
  { symbol: "AMD", price: "160.20", change: "-0.5%", up: false },
];

export default function AssetTicker() {
  return (
    <div className="fixed top-0 left-0 w-full bg-[#0a0a0a] border-b border-gray-800 z-40 h-12 flex items-center">
      <div className="bg-[#00ff9d] text-black font-bold px-4 h-full flex items-center z-50">
        LIVE MARKETS
      </div>
      <Marquee gradient={false} speed={40} className="flex-1 overflow-hidden">
        {assets.map((asset, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 text-sm font-mono">
            <span className="font-bold text-gray-300">{asset.symbol}</span>
            <span className="text-white">${asset.price}</span>
            <span className={`flex items-center ${asset.up ? "text-green-400" : "text-red-400"}`}>
              {asset.up ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>}
              {asset.change}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}