"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

// ─── Data: The Core Features ──────────────────────────────────────────
const FEATURES = [
  {
    title: "Multilingual AI Support",
    desc: "The only screening tool optimized for the Indian linguistic landscape, supporting English, Hindi, and Marathi with localized phonetic analysis.",
    icon: "🌍",
    color: "from-blue-500 to-cyan-500",
    detail: "Proprietary NLP models trained on regional accents."
  },
  {
    title: "Groq-Powered Inference",
    desc: "Zero-latency conversational feedback via LLaMA 3.3. Our 'Owly' tutor talks back instantly, keeping children engaged without loading frustration.",
    icon: "⚡",
    color: "from-orange-500 to-amber-500",
    detail: "Real-time LPU processing for human-like response speeds."
  },
  {
    title: "Edge-AI Privacy",
    desc: "Screening algorithms run locally in the browser. Sensitive handwriting and voice samples never leave the user's device.",
    icon: "🛡️",
    color: "from-emerald-500 to-teal-500",
    detail: "Zero-data retention policy for complete PII safety."
  },
  {
    title: "Gamified Bio-Markers",
    desc: "Assessments are disguised as high-quality games. We track 40+ subtle biomarkers like micro-hesitations and stroke pressure.",
    icon: "🎮",
    color: "from-violet-600 to-fuchsia-600",
    detail: "Evidence-based metrics mapped to DST & WRAT standards."
  },
  {
    title: "Smart Report Engine",
    desc: "Instantly transform screening data into a professional-grade PDF report with radar charts and actionable educator advice.",
    icon: "📊",
    color: "from-rose-500 to-pink-500",
    detail: "One-click sharing with clinical psychologists."
  },
  {
    title: "Adaptive Pathway",
    desc: "The platform evolves with the learner. If a child struggles with phonics, the UI adjusts difficulty in real-time to prevent fatigue.",
    icon: "🧠",
    color: "from-indigo-500 to-purple-500",
    detail: "Dynamic difficulty adjustment (DDA) algorithms."
  }
];

// ─── Sub-Component: Feature Card ──────────────────────────────────────
function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  return (
    <div 
      className="group relative p-8 rounded-[32px] bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-white dark:border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      {/* Dynamic Gradient Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${f.color} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity`} />
      
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-3xl mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 text-white`}>
          {f.icon}
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 font-display uppercase tracking-tight">
          {f.title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
          {f.desc}
        </p>

        <div className="pt-5 border-t border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            Technical Spec
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
            {f.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function FeaturePage() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 bg-[#fafcff] dark:bg-[#06080f] font-sans selection:bg-violet-200">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&family=Inter:wght@400;500;600;700&display=swap');
        h1, h2, h3, .font-display { font-family: 'Nunito', sans-serif; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .float-anim { animation: float-slow 8s ease-in-out infinite; }
      `}</style>

      {/* ── BREATHTAKING BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-400/10 dark:bg-orange-600/10 blur-[100px]" />
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-[#06080f]/60 border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg group-hover:scale-105 transition-transform">L</div>
          <span className="font-black text-lg text-slate-900 dark:text-white">Learnable <span className="text-violet-600">Pro</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/how-it-works" className="hidden md:block text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">Methodology</Link>
          <button onClick={toggle} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xl shadow-sm transition-all hover:scale-110">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        
        {/* ── HERO SECTION ── */}
        <div className="max-w-4xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-violet-200 dark:border-violet-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Core Capabilities
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] mb-8 tracking-tighter">
            Engineering for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500">Neuro-Inclusion.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            Learnable isn't just an assessment—it's a high-performance engine designed to identify potential and unlock learning for every child.
          </p>
        </div>

        {/* ── FEATURE GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} f={f} i={i} />
          ))}
        </div>

        {/* ── BENTO HIGHLIGHT SECTION ── */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-[40px] bg-slate-900 p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Built for the Indian Context</h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8 max-w-xl">
                Standard dyslexia screenings are often Western-centric. We’ve rebuilt the engine to account for phonetic nuances in Hindi and Marathi, ensuring accurate results regardless of the primary language spoken at home.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Hindi (हिन्दी)", "Marathi (मराठी)", "English"].map(lang => (
                  <span key={lang} className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 text-sm font-bold">
                    {lang}
                  </span >
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[40px] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-10 text-white flex flex-col justify-between shadow-2xl float-anim">
            <div>
              <div className="text-5xl mb-6">🦉</div>
              <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">The Owly Edge</h2>
              <p className="text-violet-100 font-medium leading-relaxed">
                By leveraging the **Groq LPU Architecture**, our AI tutor responds in under 500ms. This prevents the "Cognitive Gap" where a child loses focus while waiting for a server response.
              </p>
            </div>
            <Link href="/how-it-works" className="mt-8 text-sm font-black uppercase tracking-widest bg-white text-violet-600 py-4 rounded-2xl text-center hover:bg-violet-50 transition-colors shadow-lg">
              Explore Tech Stack →
            </Link>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 font-display">Experience the future of Learnable.</h2>
          <Link href="/signup" className="group relative inline-flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
             <span className="relative z-10">Create Your Free ID</span>
             <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

      </main>

      {/* Footer Disclaimer */}
      <footer className="py-12 border-t border-slate-200 dark:border-white/10 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
           Learnable · 2026 · AI for Social Good
        </p>
      </footer>
    </div>
  );
}