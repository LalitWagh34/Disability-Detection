"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function StatBadge({ v, icon, color, bg, isCollapsed, isDark }: { v: any; icon: string; color: string; bg: string, isCollapsed: boolean, isDark: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl font-black shadow-sm border transition-all duration-300 backdrop-blur-md
      ${isCollapsed ? 'px-2 py-2' : 'px-4 py-2'}
      ${isDark ? 'border-white/10' : 'border-violet-200/40'}`}
      style={{ background: bg, color }}>
      <span className="text-lg">{icon}</span> 
      {!isCollapsed && <span className="text-sm font-bold">{v}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => setMounted(true), []);

  const assessments = useLiveQuery(
    () => user ? db.assessments.where("userId").equals(user.id).toArray() : [],
    [user]
  ) || [];

  if (!mounted || !user) return null;

  const xpPct = (user.xp || 0) % 100;
  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const navLinks = [
    { label: "Dashboard", icon: "🏠", href: "/dashboard" },
    { label: "Learning Path", icon: "🎮", href: "/practice" },
    { label: "Health Report", icon: "📊", href: "/report" },
    { label: "Specialists", icon: "🏥", href: "/specialists" },
    { label: "Profile", icon: "👤", href: "/profile" },
  ];

  return (
    <div className={`min-h-screen flex bg-transparent font-sans transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-700'}`}>
      
      {/* ══ SIDEBAR ══ */}
      <aside 
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 p-4 z-50 transition-all duration-500 ease-in-out border-r backdrop-blur-3xl
          ${isSidebarOpen ? 'w-72' : 'w-20'} 
          ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-violet-50/60 border-violet-100'}`}
      >
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60]"
        >
          {isSidebarOpen ? '‹' : '›'}
        </button>

        <div className={`flex items-center gap-3 mb-12 px-2 transition-all duration-500 ${!isSidebarOpen ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center text-white text-xl font-black bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg">L</div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tight text-violet-900 dark:text-white">LearnAble</span>}
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 
                  ${active ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/20' : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-violet-100/50 hover:text-violet-700'} 
                  ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
              >
                <span className="text-xl">{link.icon}</span>
                {isSidebarOpen && <span className="animate-in fade-in duration-300">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto pt-6 border-t ${isDark ? 'border-white/10' : 'border-violet-100'}`}>
          <button onClick={logout} 
            className={`flex items-center gap-4 px-4 py-3 w-full font-bold transition-colors 
              ${isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'} 
              ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <main className={`flex-1 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12 transition-all duration-500 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <p className={`text-sm font-bold uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-slate-500' : 'text-violet-400'}`}>{greet()},</p>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user.name.split(" ")[0]} <span className="text-violet-600 text-2xl md:text-3xl">🚀</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <StatBadge v={user.streak || 0} icon="🔥" color="#d97706" bg={isDark ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.12)"} isCollapsed={false} isDark={isDark} />
             <StatBadge v={user.hearts ?? 5} icon="❤️" color="#dc2626" bg={isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.12)"} isCollapsed={false} isDark={isDark} />
             <StatBadge v={user.gems ?? 0} icon="💎" color="#2563eb" bg={isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.12)"} isCollapsed={false} isDark={isDark} />
             
             <button onClick={toggle} className={`w-11 h-11 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-all hover:scale-110 ml-2
                ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-violet-200 text-violet-600 shadow-sm'}`}>
                {isDark ? '☀️' : '🌙'}
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <section className={`backdrop-blur-3xl border rounded-[32px] p-8 shadow-xl transition-all duration-500
              ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-violet-50/40 border-white shadow-violet-100/50'}`}>
               <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-1">Learning Level</h2>
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Next milestone: Level { (user.level || 1) + 1 }</p>
                  </div>
                  <span className="text-4xl font-black text-violet-600">Lv.{user.level || 1}</span>
               </div>
               <div className={`h-4 rounded-full overflow-hidden relative ${isDark ? 'bg-white/5' : 'bg-violet-100'}`}>
                  <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all duration-1000" style={{ width: `${xpPct}%` }} />
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Dyslexia', 'Dysgraphia', 'Dyscalculia'].map((label, i) => (
                <div key={label} className={`backdrop-blur-3xl border rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group
                  ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-violet-50/50 border-white shadow-violet-100/30'}`}>
                   <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">
                     {i === 0 ? "📖" : i === 1 ? "✍️" : "🔢"}
                   </div>
                   <h3 className="font-black mb-4 uppercase tracking-tighter">{label}</h3>
                   <Link href={`/assessment/${label.toLowerCase()}`} className="inline-flex items-center gap-2 text-xs font-black text-violet-600 hover:gap-3 transition-all uppercase tracking-widest">
                      Start Test →
                   </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <section className={`rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl group transition-all duration-500
              ${isDark ? 'bg-violet-950/30 border border-white/5' : 'bg-slate-800 shadow-violet-200/50'}`}>
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Today's Goal</h3>
                <p className="text-violet-100/80 text-sm font-medium mb-6 leading-relaxed">Complete 2 phonics games to keep your streak alive!</p>
                <Link href="/practice" className="block w-full py-4 bg-white text-slate-900 rounded-2xl text-center font-black text-sm uppercase tracking-widest hover:bg-violet-50 transition-all shadow-lg">
                  Play Now
                </Link>
              </div>
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-700 pointer-events-none">🦉</div>
            </section>

            <section className={`backdrop-blur-3xl border rounded-[32px] p-8 transition-all duration-500
              ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-violet-50/40 border-white shadow-violet-100/20'}`}>
              <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Recent Badges</h3>
              <div className="flex gap-4">
                 {["🏅", "🌟", "🔥"].map(badge => (
                   <div key={badge} className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl grayscale border transition-all hover:grayscale-0 cursor-help ${isDark ? 'bg-white/5 border-white/5' : 'bg-violet-100/50 border-violet-200'}`}>
                     {badge}
                   </div>
                 ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}