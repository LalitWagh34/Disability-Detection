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
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
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
          <span className="text-2xl">{icon}</span>
          {risk ? (
            <span className="text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded-full"
              style={{ background: `${riskColor}22`, color: riskColor }}>
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
    <svg viewBox="0 0 300 300" className="w-full h-full" style={{ opacity: 0.06 }}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth="1.2"
          style={{ opacity: 1 - i * 0.06 }} />
      ))}
    </svg>
  );
}

// ─── Holographic tilt card ────────────────────────────────────────────────────
function HoloCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPos({ x: 50, y: 50 }); }}
      className="relative overflow-hidden transition-all duration-500"
      style={{
        ...style,
        transform: hovering
          ? `perspective(1000px) rotateX(${(pos.y - 50) * -0.06}deg) rotateY(${(pos.x - 50) * 0.06}deg) scale(1.01)`
          : "perspective(1000px) rotateX(0) rotateY(0) scale(1)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{
          opacity: hovering ? 0.12 : 0,
          background: `radial-gradient(ellipse at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.8) 0%, rgba(168,85,247,0.4) 30%, rgba(59,130,246,0.3) 60%, transparent 80%)`,
          mixBlendMode: "overlay",
        }} />
      {children}
    </div>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────
function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2.5">
        <span className="text-base w-6 text-center">{icon}</span>
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
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

  const assessments = useLiveQuery(
    () => (user ? db.assessments.where("userId").equals(user.id).toArray() : []),
    [user]
  ) || [];

  const handleDeleteData = async () => {
    if (!user) return;
    if (confirm("Delete your account and all data permanently?")) {
      await db.users.delete(user.id);
      await db.assessments.where("userId").equals(user.id).delete();
      logout();
      router.push("/");
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#06060f" }}>
      <p className="text-white/40 text-sm">
        Please <Link href="/login" className="text-violet-400 font-bold underline">log in</Link>.
      </p>
    </div>
  );

  const latest = (type: string) =>
    assessments.filter(a => a.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const dy = latest("dyslexia");
  const dg = latest("dysgraphia");
  const dc = latest("dyscalculia");

  const pct = (r: any) => r ? Math.round((r.score / r.total) * 100) : 0;
  const dyPct = pct(dy), dgPct = pct(dg), dcPct = pct(dc);

  const brainScores = [dyPct || 45, dgPct || 60, dcPct || 35, user.xp || 10, user.level || 1];
  const joined = new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  const totalDone = [dy, dg, dc].filter(Boolean).length;
  const tier = (user.xp || 0) >= 500 ? "🏆 Champion" : (user.xp || 0) >= 200 ? "⭐ Explorer" : "🌱 Beginner";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6 pb-20"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #06060f 60%)" }}>

      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-white/40 hover:text-white text-sm font-medium transition-colors">
          ← Back
        </Link>
        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Learner ID</span>
        <button onClick={toggle} className="text-white/40 hover:text-white transition-colors">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* ── THE CARD (flip container) ── */}
      <div className="w-full max-w-lg" style={{ perspective: "1200px" }}>
        <div className="relative transition-all duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "680px",
          }}>

          {/* ══════ FRONT ══════ */}
          <HoloCard style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "2rem",
            background: "linear-gradient(145deg, #1c0f3a 0%, #0f1f3a 50%, #0f2a1f 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
          } as any}>

            {/* Brain fingerprint bg */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "2rem" }}>
              <BrainPrint scores={brainScores} />
            </div>

            <div className="relative z-10 p-7">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>L</div>
                  <span className="text-white/60 text-xs font-black tracking-widest uppercase">LearnAble</span>
                </div>
                <span className="text-[10px] font-black tracking-wide px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.25)" }}>
                  {tier}
                </span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-4 mb-7">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl blur-md"
                    style={{ background: "linear-gradient(135deg, #7c3aed55, #0d948855)" }} />
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="relative w-20 h-20 rounded-2xl"
                    style={{ border: "1.5px solid rgba(255,255,255,0.15)" }}
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "2px solid #06060f" }}>
                    {user.level || 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-black text-white leading-tight truncate">{user.name}</h1>
                  <p className="text-white/30 text-xs mt-0.5 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-white/40">Age {user.age}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-[11px] text-white/40">Since {joined}</span>
                  </div>
                </div>
              </div>

              {/* 3 Sonar rings */}
              <div className="flex justify-between mb-7">
                <SonarRing pct={100 - dyPct} color="#7c3aed" label="Dyslexia" icon="📖"
                  risk={dy?.risk} delay={0} onClick={() => router.push("/assessment/dyslexia")} />
                <SonarRing pct={100 - dgPct} color="#0d9488" label="Dysgraphia" icon="✍️"
                  risk={dg?.risk} delay={200} onClick={() => router.push("/assessment/dysgraphia")} />
                <SonarRing pct={100 - dcPct} color="#ea580c" label="Dyscalculia" icon="🔢"
                  risk={dc?.risk} delay={400} onClick={() => router.push("/assessment/dyscalculia")} />
              </div>

              {/* XP bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] text-white/30 font-bold mb-1.5 uppercase tracking-widest">
                  <span>Experience</span>
                  <span>{(user.xp || 0) % 100}/100 XP</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${(user.xp || 0) % 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #a855f7, #f0abfc)",
                      boxShadow: "0 0 12px #a855f788",
                      transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                    }} />
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { v: `${user.xp || 0}`, l: "XP" },
                  { v: `❤️ ${user.hearts ?? 5}`, l: "Lives" },
                  { v: `💎 ${user.gems ?? 0}`, l: "Gems" },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-base font-black text-white">{v}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {[dy, dg, dc].map((a, i) => (
                    <div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: a ? ["#7c3aed", "#0d9488", "#ea580c"][i] : "rgba(255,255,255,0.1)" }} />
                  ))}
                  <span className="text-[10px] text-white/25 ml-1">{totalDone}/3 assessed</span>
                </div>
                <button onClick={() => setCardFlipped(true)}
                  className="text-[10px] text-white/25 hover:text-white/60 transition-colors font-bold tracking-widest uppercase">
                  flip →
                </button>
              </div>
            </div>
          </HoloCard>

          {/* ══════ BACK ══════ */}
          <div className="absolute inset-0 overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: "2rem",
              background: "linear-gradient(145deg, #0f1f3a 0%, #1c0f3a 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
            } as any}>

            {/* Magnetic strip */}
            <div className="h-12 w-full mt-8" style={{ background: "rgba(0,0,0,0.6)" }} />

            <div className="px-7 py-5 space-y-1">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-4">Account Details</p>
              <StatRow icon="🔥" label="Day Streak" value={`${user.streak || 0} days`} />
              <StatRow icon="📋" label="Assessments" value={`${totalDone} / 3`} />
              <StatRow icon="🏆" label="Tier" value={tier} />
              <StatRow icon="📅" label="Member Since" value={joined} />
              <StatRow icon="🎯" label="Completed Units" value={user.completedUnits?.length || 0} />
            </div>

            <div className="px-7 mt-4 space-y-2">
              <button onClick={() => router.push("/report")}
                className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                📊 Full Report
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => router.push("/specialists")}
                  className="py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
                  style={{ background: "rgba(59,130,246,0.3)", border: "1px solid rgba(59,130,246,0.3)" }}>
                  🏥 Specialists
                </button>
                <button onClick={() => router.push("/parent")}
                  className="py-2.5 rounded-xl text-xs font-black text-white/60 hover:text-white transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  🔒 Parent
                </button>
              </div>
            </div>

            <div className="px-7 mt-4 flex gap-2">
              <button onClick={logout}
                className="flex-1 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors">
                Sign Out
              </button>
              <button onClick={handleDeleteData}
                className="flex-1 py-2 text-xs font-bold text-red-500/50 hover:text-red-400 transition-colors">
                Delete Account
              </button>
            </div>

            <div className="text-center mt-4">
              <button onClick={() => setCardFlipped(false)}
                className="text-[10px] text-white/20 hover:text-white/50 transition-colors font-bold tracking-widest uppercase">
                ← flip back
              </button>
            </div>
          </div>

        </div>
      </div>

      <p className="text-white/15 text-[11px] mt-8 font-medium tracking-wide">
        hover to tilt · tap rings to assess · flip for details
      </p>
    </div>
  );
}