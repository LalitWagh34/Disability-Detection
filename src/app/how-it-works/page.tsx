"use client";

import Link from "next/link";
import { useState } from "react";

// ─── Custom Illustrations (SVGs) ──────────────────────────────────────────────

function GameIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-8 group">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500">
        <rect x="40" y="30" width="320" height="240" rx="24" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
        <rect x="50" y="40" width="300" height="220" rx="16" fill="url(#screenGrad)" />
        <rect x="70" y="60" width="80" height="12" rx="6" fill="white" opacity="0.6" />
        <rect x="290" y="60" width="40" height="12" rx="6" fill="white" opacity="0.6" />
        <g className="animate-[float_4s_ease-in-out_infinite]">
          <circle cx="120" cy="150" r="35" fill="white" className="drop-shadow-lg" />
          <circle cx="120" cy="150" r="25" fill="#a855f7" />
        </g>
        <g className="animate-[float_4s_ease-in-out_infinite_1s]">
          <rect x="165" y="115" width="70" height="70" rx="20" fill="white" className="drop-shadow-lg" />
          <rect x="175" y="125" width="50" height="50" rx="12" fill="#d946ef" />
        </g>
        <g className="animate-[float_4s_ease-in-out_infinite_2s]">
          <polygon points="280,115 320,185 240,185" fill="white" className="drop-shadow-lg" strokeLinejoin="round" />
          <polygon points="280,130 305,175 255,175" fill="#f43f5e" strokeLinejoin="round" />
        </g>
        <rect x="100" y="230" width="200" height="8" rx="4" fill="white" opacity="0.3" />
        <rect x="100" y="230" width="130" height="8" rx="4" fill="white" />
        <defs>
          <linearGradient id="screenGrad" x1="50" y1="40" x2="350" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function AIAnalysisIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-8 group">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-500/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500">
        <rect x="40" y="30" width="320" height="240" rx="24" fill="url(#aiGrad)" />
        <path d="M40 150 Q 120 50 200 150 T 360 150" stroke="white" strokeWidth="3" opacity="0.2" fill="none" />
        <path d="M40 120 Q 150 200 200 120 T 360 120" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
        {[
          { cx: 100, cy: 150, r: 6 }, { cx: 150, cy: 100, r: 8 }, 
          { cx: 250, cy: 200, r: 5 }, { cx: 300, cy: 150, r: 7 }
        ].map((node, i) => (
          <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
            <circle cx={node.cx} cy={node.cy} r={node.r * 2} fill="white" opacity="0.2" />
            <circle cx={node.cx} cy={node.cy} r={node.r} fill="white" />
          </g>
        ))}
        <circle cx="200" cy="150" r="45" fill="white" opacity="0.1" className="animate-ping" />
        <circle cx="200" cy="150" r="30" fill="white" className="drop-shadow-lg" />
        <path d="M190 140 H 210 V 160 H 190 Z" fill="#0d9488" />
        <circle cx="200" cy="150" r="10" fill="#14b8a6" />
        <rect x="40" y="148" width="320" height="4" fill="white" opacity="0.5">
          <animate attributeName="y" values="50;240;50" dur="4s" repeatCount="indefinite" />
        </rect>
        <defs>
          <linearGradient id="aiGrad" x1="40" y1="30" x2="360" y2="270" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function PathwayIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-8 group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500">
        <rect x="40" y="30" width="320" height="240" rx="24" fill="url(#pathGrad)" />
        <path d="M 80 230 C 120 230, 150 180, 200 180 C 250 180, 280 130, 320 130" stroke="white" strokeWidth="20" strokeLinecap="round" opacity="0.3" />
        <path d="M 80 230 C 120 230, 150 180, 200 180 C 250 180, 280 130, 320 130" stroke="white" strokeWidth="16" strokeLinecap="round" strokeDasharray="10 10" />
        <g transform="translate(130, 205)" className="animate-[float_4s_ease-in-out_infinite]">
          <circle cx="0" cy="0" r="12" fill="white" />
          <circle cx="0" cy="0" r="6" fill="#f97316" />
        </g>
        <g transform="translate(230, 155)" className="animate-[float_4s_ease-in-out_infinite_1s]">
          <circle cx="0" cy="0" r="12" fill="white" />
          <circle cx="0" cy="0" r="6" fill="#f97316" />
        </g>
        <g transform="translate(320, 100)" className="animate-[float_4s_ease-in-out_infinite_2s]">
          <circle cx="0" cy="0" r="24" fill="white" className="drop-shadow-lg" />
          <path d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 6 9 L 0 5 L -6 9 L -4 2 L -10 -3 L -3 -3 Z" fill="#f59e0b" transform="scale(1.2)" />
        </g>
        <rect x="70" y="60" width="100" height="40" rx="10" fill="white" opacity="0.9" className="drop-shadow-md" />
        <rect x="85" y="75" width="40" height="6" rx="3" fill="#f97316" opacity="0.4" />
        <rect x="85" y="87" width="70" height="4" rx="2" fill="#f97316" opacity="0.2" />
        <defs>
          <linearGradient id="pathGrad" x1="40" y1="30" x2="360" y2="270" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── FAQ Component ────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-8 py-6 flex items-center justify-between focus:outline-none"
      >
        <span className="font-bold text-slate-900 text-lg">{q}</span>
        <span className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-violet-50 text-violet-600' : ''}`}>
          ↓
        </span>
      </button>
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-8 pb-6 text-slate-500 leading-relaxed font-medium">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Content / Data ───────────────────────────────────────────────────────────
const T = {
  en: {
    back: "← Back to Home",
    badge: "The Science Behind LearnAble",
    titleLine1: "Three Steps to",
    titleLine2: "Clarity.",
    subtitle: "We combine engaging, gamified assessments with state-of-the-art machine learning to screen for learning differences accurately and privately.",
    steps: [
      {
        n: "01",
        title: "Play Adaptive Games",
        desc: "Children complete a series of fun, interactive mini-games. Behind the scenes, our engine measures reaction times, error patterns, and phonological processing speed.",
        tech: "Built on published rubrics (DST, WRAT) using dynamic difficulty adjustment.",
        color: "from-violet-500 to-fuchsia-500",
        shadow: "shadow-violet-500/20",
        icon: "🎮",
        Illustration: GameIllustration
      },
      {
        n: "02",
        title: "AI-Driven Analysis",
        desc: "The assessment data is processed locally in the browser. Our models calculate risk confidence scores for Dyslexia, Dysgraphia, and Dyscalculia without sending sensitive data to a server.",
        tech: "Utilizes advanced heuristics and decision-tree logic for scoring.",
        color: "from-teal-400 to-emerald-500",
        shadow: "shadow-teal-500/20",
        icon: "🧠",
        Illustration: AIAnalysisIllustration
      },
      {
        n: "03",
        title: "Personalised Pathways",
        desc: "Based on the screening flags, the platform instantly generates a tailored learning roadmap. Parents can download detailed PDF reports to share with special educators.",
        tech: "Features Groq-powered LLaMA 3.3 for the 'Owly' AI Tutor support.",
        color: "from-orange-400 to-amber-500",
        shadow: "shadow-orange-500/20",
        icon: "📈",
        Illustration: PathwayIllustration
      }
    ],
    architecture: {
      title: "Engineered for Speed & Privacy.",
      subtitle: "We leverage cutting-edge AI inference to provide real-time feedback while keeping your child's data strictly on your device.",
      cards: [
        {
          icon: "⚡",
          title: "Powered by Groq API",
          desc: "Our 'Owly' AI Tutor runs LLaMA 3.3 70B on Groq's LPU architecture. This means near-instant, real-time conversational support without frustrating loading screens for the child.",
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20"
        },
        {
          icon: "🔒",
          title: "Zero Data Retention",
          desc: "The screening algorithms run entirely in your local browser. No personally identifiable information (PII), handwriting samples, or risk scores are ever saved to our servers.",
          color: "text-teal-500",
          bg: "bg-teal-500/10",
          border: "border-teal-500/20"
        },
        {
          icon: "⚙️",
          title: "Evidence-Based ML",
          desc: "Our heuristics map directly to published clinical rubrics (DST, WRAT). The engine acts as an early-warning system, not a replacement for medical professionals.",
          color: "text-violet-500",
          bg: "bg-violet-500/10",
          border: "border-violet-500/20"
        }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: [
        { q: "Is this a formal medical diagnosis?", a: "No. LearnAble is an advanced early-screening tool. It identifies risk patterns for learning differences with high accuracy, but a formal diagnosis must always be made by a certified clinical psychologist or special educator." },
        { q: "What age group is this designed for?", a: "Our adaptive games and screening baselines are currently optimized for children aged 6 to 12 years old, covering early reading to foundational maths." },
        { q: "How is the Owly AI Tutor so fast?", a: "Owly is powered by the Groq API, running advanced Large Language Models on specialized hardware. This allows the tutor to talk, encourage, and guide your child in real-time, matching the speed of human conversation." },
        { q: "Is it really 100% free?", a: "Yes. The core screening tools and PDF reports are completely free, forever. We believe every child deserves to be understood, regardless of financial barriers." },
      ]
    },
    ctaTitle: "Ready to see it in action?",
    ctaBtn: "Start Free Assessment",
  }
};


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const t = T.en; 

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-900 selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden font-sans">
      
      {/* ── Styles & Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        h1,h2,h3,.font-display { font-family: 'Nunito', sans-serif; }
        
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
            <span className="group-hover:-translate-x-1 transition-transform">{t.back}</span>
          </Link>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-md">
            L
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-300/20 mix-blend-multiply filter blur-[100px] animate-blob" />
          <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-teal-200/20 mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-3xl mx-auto relative z-10 text-center fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm text-slate-600">
            🔬 {t.badge}
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight text-slate-900">
            {t.titleLine1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">
              {t.titleLine2}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl leading-relaxed text-slate-500 font-medium max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* ══ TIMELINE STEPS ══ */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto relative">
          
          <div className="absolute left-[28px] md:left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-violet-200 via-teal-200 to-orange-200 -translate-x-1/2 rounded-full hidden md:block" />

          <div className="space-y-24 md:space-y-32">
            {t.steps.map((step, i) => {
              const Illustration = step.Illustration;
              const isEven = i % 2 === 0;

              return (
                <div key={i} className={`relative flex flex-col md:flex-row items-center gap-10 md:gap-16 fade-up ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`} style={{ animationDelay: `${i * 150}ms` }}>
                  
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-slate-50 shadow-lg items-center justify-center z-10">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${step.color} opacity-20 absolute animate-ping`} />
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} shadow-inner flex items-center justify-center text-white text-xs font-black`}>
                      {step.n}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12 lg:pr-20' : 'md:pl-12 lg:pl-20'}`}>
                    <div className={`glass-card p-8 md:p-10 rounded-[32px] hover:-translate-y-2 transition-transform duration-500 shadow-xl ${step.shadow} relative overflow-hidden group`}>
                      <div className={`absolute -inset-10 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-2xl`} />

                      <div className="text-4xl mb-6 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                        {step.icon}
                      </div>
                      
                      <h3 className="text-3xl font-black mb-4 text-slate-900" style={{ fontFamily: "Nunito,sans-serif" }}>
                        {step.title}
                      </h3>
                      
                      <p className="text-slate-500 text-base leading-relaxed mb-6">
                        {step.desc}
                      </p>

                      <div className="inline-flex flex-col gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left w-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Technical Engine</span>
                        <span className="text-sm font-semibold text-slate-700">{step.tech}</span>
                      </div>
                    </div>
                  </div>

                  {/* Illustration */}
                  <div className={`w-full md:w-1/2 h-64 sm:h-80 md:h-[400px] ${isEven ? 'md:pl-12 lg:pl-20' : 'md:pr-12 lg:pr-20'}`}>
                    <Illustration />
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ ARCHITECTURE & GROQ API ══ */}
      <section className="py-24 px-6 relative z-10 bg-white border-y border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl font-black mb-4 text-slate-900" style={{ fontFamily: "Nunito,sans-serif" }}>
              {t.architecture.title}
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              {t.architecture.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 fade-up delay-100">
            {t.architecture.cards.map((card, i) => (
              <div key={i} className={`p-8 rounded-[32px] border ${card.border} bg-slate-50 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}>
                <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3" style={{ fontFamily: "Nunito,sans-serif" }}>
                  {card.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE FAQ ══ */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl font-black text-slate-900" style={{ fontFamily: "Nunito,sans-serif" }}>
              {t.faq.title}
            </h2>
          </div>

          <div className="space-y-4 fade-up delay-100">
            {t.faq.questions.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ══ */}
      <section className="py-32 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center fade-up">
          <h2 className="text-4xl font-black mb-8 text-white" style={{ fontFamily: "Nunito,sans-serif" }}>
            {t.ctaTitle}
          </h2>
          <Link href="/assessment/dyslexia" className="group relative inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-black text-white overflow-hidden shadow-2xl shadow-violet-500/30 hover:scale-105 transition-transform duration-300">
            <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 group-hover:bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]" />
            <span className="relative flex items-center gap-2">
              {t.ctaBtn} <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>
        </div>
      </section>

    </div>
  );
}