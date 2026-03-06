"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

// ─── Tiny animated counter ────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div className={`group relative p-6 rounded-2xl border bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${accent}`} />
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function Step({ n, title, desc, color }: { n: string; title: string; desc: string; color: string }) {
  return (
    <div className="flex gap-5">
      <div className={`w-12 h-12 rounded-full ${color} text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-lg`}>{n}</div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Testimonial card ─────────────────────────────────────────────────────────
function Testimonial({ quote, name, role, avatar }: { quote: string; name: string; role: string; avatar: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <p className="text-gray-600 text-sm leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`} alt={name} className="w-10 h-10 rounded-full bg-violet-100" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Disability pill ─────────────────────────────────────────────────────────
function Pill({ label, color }: { label: string; color: string }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{label}</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-md">L</div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600">LearnAble</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how" className="hover:text-violet-700 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-violet-700 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-violet-700 transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button className="rounded-full px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:shadow-violet-300 transition-all">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full cursor-pointer transition-all border border-gray-200">
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt="Profile"
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-violet-700 transition-colors">Log in</Link>
                <Link href="/signup">
                  <Button className="rounded-full px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-sm font-semibold shadow-md hover:shadow-violet-300 transition-all">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 pb-32 px-6">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-violet-200 rounded-full blur-[100px] opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-fuchsia-200 rounded-full blur-[100px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-blue-200 rounded-full blur-[80px] opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            AI-Powered Learning Assessment
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            <span className="text-gray-900">Unlock Every Child's</span><br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
              Learning Potential
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            LearnAble uses AI to detect <strong className="text-gray-700">Dyslexia</strong>, <strong className="text-gray-700">Dysgraphia</strong>, and <strong className="text-gray-700">Dyscalculia</strong> early — then creates a personalised game-based learning path to help them thrive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/assessment/dyslexia">
              <Button className="h-14 px-10 text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-300 hover:shadow-violet-400 hover:-translate-y-0.5 transition-all duration-300">
                🚀 Start Free Assessment
              </Button>
            </Link>
            <a href="#how">
              <Button variant="secondary" className="h-14 px-10 text-base font-semibold rounded-2xl border-2 border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-700 transition-all duration-300">
                See How it Works ↓
              </Button>
            </a>
          </div>

          {/* Disability pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <Pill label="📖 Dyslexia" color="bg-violet-100 text-violet-700" />
            <Pill label="✍️ Dysgraphia" color="bg-teal-100 text-teal-700" />
            <Pill label="🧮 Dyscalculia" color="bg-orange-100 text-orange-700" />
            <Pill label="🧠 AI Powered" color="bg-blue-100 text-blue-700" />
            <Pill label="🇮🇳 Hindi & Marathi" color="bg-green-100 text-green-700" />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-gray-100 py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 3, suffix: " Disorders", label: "Covered" },
            { val: 20, suffix: "+ games", label: "Learning Activities" },
            { val: 3, suffix: " languages", label: "English, Hindi, Marathi" },
            { val: 100, suffix: "% free", label: "No credit card needed" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-extrabold text-violet-600 mb-1">
                <Counter target={s.val} suffix={s.suffix} />
              </p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">How it Works</h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">Three simple steps from first visit to personalised learning plan.</p>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Step n="1" title="Take the Assessment" desc="Three short AI-driven tests cover reading, writing, and maths. Takes less than 15 minutes for all three." color="bg-violet-600" />
              <Step n="2" title="Get Your Report" desc="Instantly receive a professional-grade screening report with risk levels, AI confidence scores, and recommendations." color="bg-fuchsia-500" />
              <Step n="3" title="Start Learning" desc="Jump into a personalised game-based curriculum. XP, streaks, hearts, gems — just like your favourite language app." color="bg-orange-500" />
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-3xl p-8 text-white shadow-2xl shadow-violet-300">
              <div className="space-y-4">
                {["🔍 AI Screening", "📊 Detailed Report", "🎮 Game-Based Learning", "👨‍👩‍👧 Parent Dashboard", "🔊 Text-to-Speech", "📥 PDF Export (Hindi/Marathi)"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                    <span className="text-white/90 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">Everything You Need</h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">LearnAble is the only platform built specifically for learning disabilities in Indian schools.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "AI Diagnosis Engine", desc: "Neural Network trained on learning patterns detects Dyslexia risk with high accuracy from a 20-question adaptive test.", accent: "bg-violet-600" },
              { icon: "✍️", title: "Vision AI (Dysgraphia)", desc: "CNN analyses your child's handwriting pixel-by-pixel to detect motor control issues and letter formation errors.", accent: "bg-teal-600" },
              { icon: "🧮", title: "Dyscalculia Profiler", desc: "Timed arithmetic, sequencing, and clock-reading tasks mapped against age norms with response time analysis.", accent: "bg-orange-500" },
              { icon: "🎮", title: "10+ Learning Games", desc: "Phonics, Sight Words, Tracing, Maze Master, Math Race, Shape Sorter — all curriculum-aligned and gamified.", accent: "bg-blue-600" },
              { icon: "📊", title: "Rich Reporting", desc: "Professional multi-section PDF reports with bar charts, radar charts, and confidence gauges — in English, Hindi & Marathi.", accent: "bg-fuchsia-600" },
              { icon: "👨‍👩‍👧", title: "Parent Dashboard", desc: "PIN-protected parent view showing progress charts, session history, and a downloadable report for specialists.", accent: "bg-green-600" },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6 bg-[#f8f7ff]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-4">What Families Say</h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">Thousands of families across India are using LearnAble to understand their children better.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <Testimonial
              quote="My son struggled to read for years. After the assessment, we finally had a name for it — and a plan. The Phonics game is his favourite part of the day now."
              name="Priya Sharma"
              role="Mother of a 9-year-old, Pune"
              avatar="priya"
            />
            <Testimonial
              quote="The report we downloaded in Marathi was something we could finally share with my mother-in-law. She understood exactly what her granddaughter needs."
              name="Aishwarya Kulkarni"
              role="Parent, Nashik"
              avatar="aishwarya"
            />
            <Testimonial
              quote="As a special educator, I recommend LearnAble to every school I work with. The AI confidence scores help me start conversations with parents."
              name="Mr. Ramesh Patil"
              role="Special Educator, Mumbai"
              avatar="ramesh"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Every Child Learns Differently.</h2>
          <p className="text-xl text-white/80 mb-10">Find out how <em>your</em> child learns — for free, in 15 minutes.</p>
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button className="h-14 px-12 text-base font-bold rounded-2xl bg-white text-violet-700 hover:bg-violet-50 shadow-xl shadow-violet-900/20 hover:-translate-y-0.5 transition-all duration-300">
              {user ? "Go to Dashboard →" : "Create Free Account →"}
            </Button>
          </Link>
          <p className="text-white/60 text-sm mt-4">No credit card. No email required for assessment.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2 font-extrabold text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold">L</div>
              <span className="text-white">LearnAble</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/assessment/dyslexia" className="hover:text-white transition-colors">Assessment</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/report" className="hover:text-white transition-colors">Report</Link>
              <Link href="/specialists" className="hover:text-white transition-colors">Find Specialists</Link>
              <Link href="/parent" className="hover:text-white transition-colors">For Parents</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} LearnAble. Made with ❤️ for every child who learns differently.</p>
            <p className="flex gap-3">
              <Pill label="English" color="bg-gray-800 text-gray-300" />
              <Pill label="हिंदी" color="bg-gray-800 text-gray-300" />
              <Pill label="मराठी" color="bg-gray-800 text-gray-300" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
