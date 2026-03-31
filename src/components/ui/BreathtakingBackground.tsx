"use client";

import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

export default function BreathtakingBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
        }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 bg-[#fafcff] dark:bg-[#06080f]">
        {/* Violet Orb */}
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-violet-400/10 dark:bg-violet-600/15 blur-[120px] animate-blob" />
        
        {/* Orange Orb */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-400/10 dark:bg-orange-600/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        
        {/* Teal Orb (Optional for extra depth) */}
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-teal-300/5 dark:bg-teal-500/5 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        
        {/* Subtle Texture Layer */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')` }} />
      </div>
    </>
  );
}