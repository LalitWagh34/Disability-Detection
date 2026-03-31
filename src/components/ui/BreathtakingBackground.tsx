"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export default function BreathtakingBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
      `}</style>

      <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-1000 
        ${isDark ? 'bg-[#06080f]' : 'bg-[#fcfaff]'}`}> {/* 💡 Tinted Pearl base - MUCH easier on eyes */}
        
        {/* Soft Violet Orb */}
        <div className={`absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] animate-blob transition-all duration-1000
          ${isDark ? 'bg-violet-600/15' : 'bg-violet-200/30'}`} />
        
        {/* Warm Peach Orb (Adds "warmth" to reduce eye strain) */}
        <div className={`absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] animate-blob transition-all duration-1000
          ${isDark ? 'bg-orange-600/10' : 'bg-orange-100/40'}`} style={{ animationDelay: '2s' }} />
        
        {/* Soft Teal/Mint Orb */}
        <div className={`absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[100px] animate-blob transition-all duration-1000
          ${isDark ? 'bg-teal-500/5' : 'bg-emerald-100/20'}`} style={{ animationDelay: '4s' }} />
        
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }} />
      </div>
    </>
  );
}