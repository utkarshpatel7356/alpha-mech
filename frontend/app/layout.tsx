import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha-Mechanism",
  description: "AI Algorithmic Trading Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen`}>
        {/* Sidebar handles its own fixed positioning now */}
        <Sidebar />
        
        {/* Main Content Area */}
        {/* We use pl-0 by default. If you want content to push over when sidebar is open, 
            we would need global state (Context). 
            For now, let's add a large left padding ONLY if you want the sidebar always visible.
            Since you want it collapsible, a simple centered container works best. */}
        <main className="relative min-h-screen w-full pl-0 md:pl-16 pt-16"> 
            {children}
        </main>
      </body>
    </html>
  );
}