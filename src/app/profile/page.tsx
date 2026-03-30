"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ─── Sonar Ring ───────────────────────────────────────────────────────────────
function SonarRing({ pct, color, label, icon, risk, delay, onClick }: {
  pct: number; color: string; label: string; icon: string;
  risk?: string; delay: number; onClick: () => void;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), delay); }, [delay]);

  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = animated ? (pct / 100) * circ : 0;
  const riskColor = risk === "High" ? "#f87171" : risk === "Moderate" ? "#fbbf24" : risk === "Low" ? "#34d399" : "#ffffff22";

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group hover:-translate-y-1 transition-transform">
      <div className="relative w-24 h-24">
        {risk && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-10"
              style={{ background: color, animationDuration: "2.5s", animationDelay: `${delay}ms` }} />
            <span className="absolute inset-2 rounded-full animate-ping opacity-5"
              style={{ background: color, animationDuration: "2.5s", animationDelay: `${delay + 400}ms` }} />
          </>
        )}
        <svg className="absolute inset-0 -rotate-90 w-full h-full">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{
              transition: `stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl drop-shadow-md">{icon}</span>
          {risk ? (
            <span className="text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-sm"
              style={{ background: `${riskColor}22`, color: riskColor, border: `1px solid ${riskColor}44` }}>
              {risk}
            </span>
          ) : (
            <span className="text-[9px] text-white/30 mt-0.5">tap</span>
          )}
        </div>
      </div>
      <span className="text-[11px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
      <span className="text-sm font-black text-white">{risk ? `${pct}%` : "—"}</span>
    </button>
  );
}

// ─── Generative brain fingerprint from scores ─────────────────────────────────
function BrainPrint({ scores }: { scores: number[] }) {
  const paths: string[] = [];
  const cx = 150, cy = 150;
  for (let ring = 0; ring < 8; ring++) {
    const r = 20 + ring * 16;
    const points = 60 + ring * 4;
    const distort = scores[ring % scores.length] / 100;
    let d = "";
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise =
        Math.sin(angle * (3 + ring) + ring) * distort * 10 +
        Math.cos(angle * (5 + ring * 2)) * distort * 6;
      const rad = r + noise;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      d += i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    d += "Z";
    paths.push(d);
  }
  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" style={{ opacity: 0.08 }}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth="1.2"
          style={{ opacity: 1 - i * 0.06 }} />
      ))}
    </svg>
  );
}

// ─── Holographic tilt card ────────────────────────────────────────────────────
function HoloCard({ children, style = {}, disabled = false }: { children: React.ReactNode; style?: React.CSSProperties; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => !disabled && setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPos({ x: 50, y: 50 }); }}
      className="relative overflow-hidden transition-all duration-500"
      style={{
        ...style,
        transform: hovering && !disabled
          ? `perspective(1000px) rotateX(${(pos.y - 50) * -0.06}deg) rotateY(${(pos.x - 50) * 0.06}deg) scale(1.02)`
          : "perspective(1000px) rotateX(0) rotateY(0) scale(1)",
        pointerEvents: disabled ? "none" : "auto"
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: hovering && !disabled ? 0.15 : 0,
          background: `radial-gradient(ellipse at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.9) 0%, rgba(168,85,247,0.5) 30%, rgba(59,130,246,0.4) 60%, transparent 80%)`,
          mixBlendMode: "overlay",
        }} />
      {children}
    </div>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-3">
        <span className="text-lg w-6 text-center drop-shadow-md">{icon}</span>
        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const assessments = useLiveQuery(
    () => (user ? db.assessments.where("userId").equals(user.id).toArray() : []),
    [user]
  ) || [];

  const handleDeleteData = async () => {
    if (!user) return;
    if (confirm("Delete your account and all data permanently? This action cannot be undone.")) {
      await db.users.delete(user.id);
      await db.assessments.where("userId").equals(user.id).delete();
      logout();
      router.push("/");
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafcff] dark:bg-[#06080f] transition-colors duration-500">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Profile...</p>
      </div>
    </div>
  );

  const latest = (type: string) =>
    assessments.filter(a => a.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const dy = latest("dyslexia");
  const dg = latest("dysgraphia");
  const dc = latest("dyscalculia");

  // Fixed Math: Prevent NaN if total is 0
  const pct = (r: any) => (r && r.total > 0) ? Math.round((r.score / r.total) * 100) : 0;
  const dyPct = pct(dy), dgPct = pct(dg), dcPct = pct(dc);

  const brainScores = [dyPct || 45, dgPct || 60, dcPct || 35, user.xp || 10, user.level || 1];
  const joined = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const totalDone = [dy, dg, dc].filter(Boolean).length;
  const tier = (user.xp || 0) >= 500 ? "🏆 Champion" : (user.xp || 0) >= 200 ? "⭐ Explorer" : "🌱 Beginner";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start px-4 py-6 pb-20 relative overflow-hidden transition-colors duration-500 bg-[#fafcff] dark:bg-[#06080f]">

      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-white-400/10 dark:bg-white-600/20 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-teal-400/10 dark:bg-teal-600/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 relative z-10">
        <Link href="/dashboard" className="text-slate-500 dark:text-white/50 hover:text-pink-600 dark:hover:text-white text-sm font-bold transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
        </Link>
        <span className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
          Learner ID Card
        </span>
        {mounted && (
          <button onClick={toggle} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        )}
      </div>

      {/* ── THE CARD (flip container) ── */}
      <div className="w-full max-w-[420px] relative z-10" style={{ perspective: "1500px" }}>
        <div className="relative transition-all duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "720px",
          }}>

          {/* ══════ FRONT (HoloCard is always dark/glassy to look like a premium card) ══════ */}
          <HoloCard disabled={cardFlipped} style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "2.5rem",
            background: "linear-gradient(145deg, #1c0f3a 0%, #0a1128 50%, #061c16 100%)", // Premium Dark Card
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          } as React.CSSProperties}>

            {/* Brain fingerprint bg */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "2.5rem" }}>
              <BrainPrint scores={brainScores} />
            </div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              {/* Card header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>L</div>
                  <span className="text-white/70 text-[11px] font-black tracking-widest uppercase">LearnAble</span>
                </div>
                <span className="text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full shadow-sm"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#e879f9", border: "1px solid rgba(232,121,249,0.3)" }}>
                  {tier}
                </span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-5 mb-10">
                <div className="relative shrink-0 group cursor-pointer">
                  <div className="absolute -inset-2 rounded-2xl blur-lg transition-all duration-500 group-hover:blur-xl opacity-70 group-hover:opacity-100"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #0d9488)" }} />
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="relative w-24 h-24 rounded-2xl bg-slate-900 object-cover"
                    style={{ border: "2px solid rgba(255,255,255,0.2)" }}
                  />
                  <div className="absolute -bottom-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #f43f5e)", border: "3px solid #0a1128" }}>
                    {user.level || 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-white leading-tight truncate font-display mb-1">{user.name}</h1>
                  <p className="text-white/40 text-xs truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] font-bold text-white/50 bg-white/5 px-2 py-1 rounded-md">Age {user.age}</span>
                  </div>
                </div>
              </div>

              {/* 3 Sonar rings */}
              <div className="flex justify-between mb-8">
                <SonarRing pct={100 - dyPct} color="#a855f7" label="Dyslexia" icon="📖"
                  risk={dy?.risk} delay={0} onClick={() => router.push("/assessment/dyslexia")} />
                <SonarRing pct={100 - dgPct} color="#2dd4bf" label="Dysgraphia" icon="✍️"
                  risk={dg?.risk} delay={200} onClick={() => router.push("/assessment/dysgraphia")} />
                <SonarRing pct={100 - dcPct} color="#fb923c" label="Dyscalculia" icon="🔢"
                  risk={dc?.risk} delay={400} onClick={() => router.push("/assessment/dyscalculia")} />
              </div>

              {/* XP bar */}
              <div className="mb-8">
                <div className="flex justify-between text-[11px] text-white/50 font-bold mb-2 uppercase tracking-widest">
                  <span>Experience Points</span>
                  <span className="text-white/80">{(user.xp || 0) % 100}/100 XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden shadow-inner" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="h-full rounded-full relative"
                    style={{
                      width: `${(user.xp || 0) % 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #d946ef)",
                      boxShadow: "0 0 10px #d946ef88",
                      transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                    }}>
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: "skewX(-20deg)" }} />
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3 mb-auto">
                {[
                  { v: `${user.xp || 0}`, l: "Total XP", c: "from-violet-500/20 to-fuchsia-500/20", border: "border-violet-500/30" },
                  { v: `❤️ ${user.hearts ?? 5}`, l: "Lives", c: "from-rose-500/20 to-orange-500/20", border: "border-rose-500/30" },
                  { v: `💎 ${user.gems ?? 0}`, l: "Gems", c: "from-teal-500/20 to-emerald-500/20", border: "border-teal-500/30" },
                ].map(({ v, l, c, border }) => (
                  <div key={l} className={`text-center py-3 rounded-2xl bg-gradient-to-br ${c} border ${border} backdrop-blur-sm`}>
                    <p className="text-lg font-black text-white">{v}</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">{l}</p>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  {[dy, dg, dc].map((a, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full shadow-inner"
                      style={{ background: a ? ["#a855f7", "#2dd4bf", "#fb923c"][i] : "rgba(255,255,255,0.1)" }} />
                  ))}
                  <span className="text-[11px] font-bold text-white/40 ml-2">{totalDone}/3 Assessed</span>
                </div>
                <button onClick={() => setCardFlipped(true)}
                  className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-[11px] text-white font-bold tracking-widest uppercase border border-white/10">
                  Settings <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </HoloCard>

          {/* ══════ BACK (Settings & Parent Hub) ══════ */}
          <div className="absolute inset-0 overflow-hidden flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "2.5rem",
              background: "linear-gradient(145deg, #0a1128 0%, #1c0f3a 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              pointerEvents: cardFlipped ? "auto" : "none"
            } as React.CSSProperties}>

            {/* Magnetic strip */}
            <div className="h-14 w-full mt-10" style={{ background: "rgba(0,0,0,0.8)" }} />

            <div className="px-8 py-6 flex-1 flex flex-col">
              <p className="text-[11px] text-white/30 font-black uppercase tracking-widest mb-4">Learner Record</p>
              
              <div className="space-y-1 mb-8">
                <StatRow icon="🔥" label="Day Streak" value={`${user.streak || 0} days`} />
                <StatRow icon="📋" label="Assessments" value={`${totalDone} / 3`} />
                <StatRow icon="📅" label="Member Since" value={joined} />
                <StatRow icon="🎯" label="Units Completed" value={user.completedUnits?.length || 0} />
              </div>

              <div className="space-y-3 mb-auto">
                <p className="text-[11px] text-white/30 font-black uppercase tracking-widest mb-2">Actions & Settings</p>
                <button onClick={() => router.push("/report")}
                  className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] shadow-lg"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #d946ef)", boxShadow: "0 10px 20px -5px rgba(217,70,239,0.4)" }}>
                  📊 View Detailed PDF Report
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => router.push("/specialists")}
                    className="py-3 rounded-xl text-xs font-black text-white transition-all hover:bg-blue-500/30"
                    style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)" }}>
                    🏥 Find Specialists
                  </button>
                  <button onClick={() => router.push("/parent")}
                    className="py-3 rounded-xl text-xs font-black text-white transition-all hover:bg-emerald-500/30"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}>
                    🔒 Parent Hub
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                <button onClick={logout}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                  Sign Out
                </button>
                <button onClick={handleDeleteData}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                  Delete Account
                </button>
              </div>

              <div className="text-center mt-6">
                <button onClick={() => setCardFlipped(false)}
                  className="group inline-flex items-center gap-2 text-[11px] text-white/30 hover:text-white transition-colors font-bold tracking-widest uppercase">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Flip back to Profile
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <p className="text-slate-400 dark:text-white/20 text-xs mt-8 font-bold tracking-widest uppercase relative z-10 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" /> 
        Interactive ID Active
      </p>
    </div>
  );
}