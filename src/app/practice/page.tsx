"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";

// ─── Data: With RESTORED ORIGINAL ICONS ─────────────────────────────────────
const MODULE_GROUPS = [
  {
    id: "dyslexia",
    label: "Reading & Phonics",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/50",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    icon: "📖",
    lessons: [
      { id: "dyslexia_1", title: "Phonics Adventure", icon: "🎵", desc: "Sound it out" },
      { id: "dyslexia_2", title: "Sight Word Safari", icon: "🦁", desc: "Spot the words" },
      { id: "dyslexia_checkpoint", title: "Unit Quiz", icon: "🏆", desc: "Test yourself", checkpoint: true },
    ],
  },
  {
    id: "dysgraphia",
    label: "Writing & Motor",
    color: "from-teal-500 to-emerald-600",
    glow: "shadow-emerald-500/50",
    bg: "bg-teal-500/5",
    border: "border-teal-500/20",
    icon: "✍️",
    lessons: [
      { id: "dysgraphia_1", title: "Letter Tracer", icon: "✏️", desc: "Trace & learn" },
      { id: "dysgraphia_2", title: "Maze Master", icon: "🌀", desc: "Find your way" },
      { id: "dysgraphia_checkpoint", title: "Unit Quiz", icon: "🏆", desc: "Test yourself", checkpoint: true },
    ],
  },
  {
    id: "dyscalculia",
    label: "Math & Numbers",
    color: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/50",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    icon: "🔢",
    lessons: [
      { id: "dyscalculia_1", title: "Math Race", icon: "🏎️", desc: "Speed & numbers" },
      { id: "dyscalculia_2", title: "Shape Sorter", icon: "🔺", desc: "Sort & match" },
      { id: "dyscalculia_checkpoint", title: "Unit Quiz", icon: "🏆", desc: "Test yourself", checkpoint: true },
    ],
  },
];

export default function LearningPathPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || !user) return null;

  const isDark = theme === "dark";
  const completedUnits = user.completedUnits || [];

  return (
    <div className={`min-h-screen relative transition-colors duration-500 pb-32 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      
      {/* ══ HEADER ══ */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between
        ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-violet-100'}`}>
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg group-hover:-translate-x-1 transition-transform">L</div>
          <span className="font-black text-xl tracking-tight font-display">Learning Journey</span>
        </Link>
        <div className="flex items-center gap-4">
           <div className={`px-4 py-2 rounded-2xl border font-black text-xs transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-violet-50 border-violet-100 text-violet-600'}`}>
              💎 {user.gems || 0}
           </div>
           <button onClick={toggle} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110
             ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-violet-200 text-violet-600 shadow-sm'}`}>
             {isDark ? '☀️' : '🌙'}
           </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-16 space-y-16">
        
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter leading-tight">
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">Adventure</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">All training modules are unlocked. Select the area where you want to grow today.</p>
        </div>

        {/* ══ THE BENTO GRID PATH ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {MODULE_GROUPS.map((group) => (
            <div key={group.id} className={`flex flex-col rounded-[48px] p-8 border backdrop-blur-3xl transition-all duration-500 hover:shadow-2xl relative overflow-hidden
              ${isDark ? `bg-white/[0.02] ${group.border}` : `${group.bg} ${group.border} border-white shadow-xl shadow-slate-200/50`}`}>
              
              <div className="flex items-center gap-4 mb-12 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-2xl shadow-sm">
                  {group.icon}
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">{group.label}</h2>
              </div>

              {/* Vertical Path */}
              <div className="flex flex-col items-center gap-16 relative">
                {/* Visual Connector Line */}
                <div className={`absolute inset-y-0 w-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-white/50'}`} />

                {group.lessons.map((lesson, idx) => {
                  const isDone = completedUnits.includes(lesson.id);
                  const xOffset = idx % 2 === 0 ? "sm:translate-x-6" : "sm:-translate-x-6";

                  return (
                    <div key={lesson.id} className={`relative flex flex-col items-center group transition-all ${xOffset}`}>
                      
                      {/* Great Logo Style Restored */}
                      <div className="relative">
                        {/* Outer Glow Ring for current or featured levels */}
                        {!isDone && (
                          <div className={`absolute inset-0 rounded-[38px] animate-ping opacity-20 bg-gradient-to-br ${group.color}`} style={{ animationDuration: '3s' }} />
                        )}

                        <button
                          onClick={() => router.push(`/learn/${lesson.id}`)}
                          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-[38px] flex items-center justify-center text-4xl shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95
                            bg-gradient-to-br ${group.color} ${group.glow} ${lesson.checkpoint ? 'border-4 border-white/40' : ''}`}
                        >
                          <span className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                            {lesson.icon}
                          </span>
                          
                          {/* Pulsing Dash Ring Restored */}
                          {!isDone && (
                            <div className="absolute -inset-3 border-[3px] border-dashed border-white/30 rounded-[48px] animate-[spin_15s_linear_infinite]" />
                          )}

                          {/* Completion Star Restored */}
                          {isDone && (
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-xl border-[3px] border-white animate-in zoom-in">
                              ⭐
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="mt-4 text-center">
                        <span className="text-[11px] font-black uppercase tracking-widest leading-tight block mb-1">
                          {lesson.title}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {lesson.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ══ STICKY DASHBOARD BUTTON ══ */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
         <button onClick={() => router.push('/dashboard')} 
           className={`px-12 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 active:scale-95
             ${isDark ? 'bg-white text-slate-900 shadow-white/10' : 'bg-slate-900 text-white shadow-slate-900/30'}`}
         >
            Back to Base
         </button>
      </div>
    </div>
  );
}