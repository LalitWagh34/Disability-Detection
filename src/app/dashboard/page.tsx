"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useState } from "react";

// ─── Accessibility font + style injection ────────────────────────────────────
const A11Y_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Nunito:wght@700;800;900&display=swap');

  :root {
    --font-body: 'Atkinson Hyperlegible', sans-serif;
    --font-display: 'Nunito', sans-serif;
    --clr-bg: #fdf8f2;
    --clr-surface: #ffffff;
    --clr-brand: #6c3fc5;
    --clr-brand-light: #ede6ff;
    --clr-accent: #f59e0b;
    --clr-green: #16a34a;
    --clr-text: #1e1232;
    --clr-muted: #6b5e7a;
    --radius-xl: 20px;
    --radius-2xl: 28px;
    --shadow-card: 0 4px 24px rgba(108,63,197,.10);
    --shadow-btn: 0 6px 0px rgba(108,63,197,.30);
  }
  .dark-mode {
    --clr-bg: #130d21;
    --clr-surface: #1e1535;
    --clr-brand: #9d6ef8;
    --clr-brand-light: #2a1f4a;
    --clr-text: #ede9f7;
    --clr-muted: #a899c2;
    --shadow-card: 0 4px 24px rgba(0,0,0,.40);
    --shadow-btn: 0 6px 0px rgba(0,0,0,.40);
  }

  body { font-family: var(--font-body); background: var(--clr-bg); color: var(--clr-text); }

  /* ── Bigger tap targets ── */
  .lesson-btn { min-height: 88px; min-width: 88px; }

  /* ── Readable letter spacing ── */
  .readable { letter-spacing: 0.04em; line-height: 1.75; word-spacing: 0.12em; }

  /* ── Focus ring ── */
  :focus-visible { outline: 4px solid var(--clr-accent); outline-offset: 3px; border-radius: 8px; }

  /* ── XP bar shimmer ── */
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  .xp-shimmer::after {
    content:''; position:absolute; inset:0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.5) 50%, transparent 100%);
    animation: shimmer 2.2s infinite;
  }

  /* ── Bounce in ── */
  @keyframes bounceIn {
    0%   { opacity:0; transform: scale(.7) translateY(16px); }
    60%  { opacity:1; transform: scale(1.06) translateY(-4px); }
    100% { transform: scale(1) translateY(0); }
  }
  .bounce-in { animation: bounceIn .55s cubic-bezier(.34,1.56,.64,1) both; }

  /* ── Slide up ── */
  @keyframes slideUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .slide-up { animation: slideUp .45s ease both; }

  /* ── Connector ── */
  .path-line {
    position:absolute; left:50%; top:0; bottom:0;
    width:6px; margin-left:-3px;
    background: repeating-linear-gradient(to bottom, var(--clr-brand-light) 0px, var(--clr-brand-light) 14px, transparent 14px, transparent 22px);
    border-radius: 4px; z-index:0;
  }

  /* ── Stat pill ── */
  .stat-pill {
    display:flex; align-items:center; gap:5px;
    padding: 6px 14px; border-radius:999px;
    font-family: var(--font-display); font-weight:800; font-size:15px;
    border: 2px solid; cursor:default; transition: transform .15s;
  }
  .stat-pill:hover { transform: scale(1.08); }
`;

const LEARNING_PATH = [
  {
    unit: 1, title: "Basics of Language",
    color: "#2563eb", lightColor: "#dbeafe", darkColor: "#1d4ed8",
    emoji: "🗣️",
    lessons: [
      { id: "dyslexia_1", title: "Phonics Adventure", type: "game", icon: "🎵", desc: "Sound it out!" },
      { id: "dyslexia_2", title: "Sight Word Safari", type: "game", icon: "🦁", desc: "Spot the words" },
      { id: "dyslexia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆", desc: "Show what you know" },
    ],
  },
  {
    unit: 2, title: "Writing Mastery",
    color: "#7c3aed", lightColor: "#ede9fe", darkColor: "#5b21b6",
    emoji: "✍️",
    lessons: [
      { id: "dysgraphia_1", title: "Letter Tracer", type: "game", icon: "✏️", desc: "Trace & learn" },
      { id: "dysgraphia_2", title: "Maze Master", type: "game", icon: "🌀", desc: "Find your way" },
      { id: "dysgraphia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆", desc: "Show what you know" },
    ],
  },
  {
    unit: 3, title: "Number Sense",
    color: "#16a34a", lightColor: "#dcfce7", darkColor: "#15803d",
    emoji: "🔢",
    lessons: [
      { id: "dyscalculia_1", title: "Math Race", type: "game", icon: "🏎️", desc: "Speed & numbers" },
      { id: "dyscalculia_2", title: "Shape Sorter", type: "game", icon: "🔺", desc: "Sort & match" },
      { id: "dyscalculia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆", desc: "Show what you know" },
    ],
  },
];

const QUICK_LINKS = [
  { label: "My Report", href: "/report", icon: "📊", color: "#2563eb", bg: "#dbeafe" },
  { label: "Profile", href: "/profile", icon: "👤", color: "#7c3aed", bg: "#ede9fe" },
  { label: "Specialist", href: "/specialists", icon: "🏥", color: "#0891b2", bg: "#cffafe" },
  { label: "Parent Area", href: "/parent", icon: "🔒", color: "#b45309", bg: "#fef3c7" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [textSize, setTextSize] = useState<"normal" | "large">("normal");
  const isDark = theme === "dark";
  const completedUnits = user?.completedUnits || [];

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--clr-bg)" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👋</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 20, color: "var(--clr-muted)", marginBottom: 20 }}>
          Please log in to see your learning adventure!
        </p>
        <Link href="/login" style={{
          display: "inline-block", background: "var(--clr-brand)", color: "#fff",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
          padding: "14px 36px", borderRadius: 999, textDecoration: "none",
          boxShadow: "var(--shadow-btn)"
        }}>
          Go to Login →
        </Link>
      </div>
    </div>
  );

  const xpProgress = (user.xp || 0) % 100;
  const fs = textSize === "large" ? 1.2 : 1;

  return (
    <div className={isDark ? "dark-mode" : ""} style={{ minHeight: "100vh", background: "var(--clr-bg)", fontFamily: "var(--font-body)", fontSize: `${fs}rem` }}>
      <style>{A11Y_STYLES}</style>

      {/* ══════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: isDark ? "rgba(19,13,33,.95)" : "rgba(255,255,255,.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `3px solid ${isDark ? "#2a1f4a" : "#ede6ff"}`,
        padding: "12px 20px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg,#6c3fc5,#f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, boxShadow: "0 3px 12px rgba(108,63,197,.4)"
            }}>🧠</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: `${1.2 * fs}rem`, color: "var(--clr-brand)" }}>
              LearnAble
            </span>
          </Link>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div className="stat-pill" aria-label={`${user.streak || 0} day streak`}
              style={{ color: "#d97706", background: "#fef3c7", borderColor: "#fde68a" }}>
              🔥 <span>{user.streak || 0}</span>
            </div>
            <div className="stat-pill" aria-label={`${user.hearts ?? 5} hearts`}
              style={{ color: "#dc2626", background: "#fee2e2", borderColor: "#fca5a5" }}>
              ❤️ <span>{user.hearts ?? 5}</span>
            </div>
            <div className="stat-pill" aria-label={`${user.gems ?? 0} gems`}
              style={{ color: "#2563eb", background: "#dbeafe", borderColor: "#93c5fd" }}>
              💎 <span>{user.gems ?? 0}</span>
            </div>

            {/* Text size toggle */}
            <button
              onClick={() => setTextSize(s => s === "normal" ? "large" : "normal")}
              aria-label="Toggle text size"
              title="Toggle text size"
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: isDark ? "#2a1f4a" : "#ede6ff",
                border: "none", cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              {textSize === "large" ? "🔡" : "🔠"}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: isDark ? "#2a1f4a" : "#ede6ff",
                border: "none", cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO CARD
      ══════════════════════════════════════════ */}
      <section aria-label="Welcome banner" style={{
        background: isDark
          ? "linear-gradient(135deg,#1e1040 0%,#2d1a5e 100%)"
          : "linear-gradient(135deg,#6c3fc5 0%,#a855f7 50%,#f59e0b 150%)",
        padding: "32px 20px 0",
        position: "relative", overflow: "hidden",
      }}>

        {/* Background deco circles */}
        <div aria-hidden style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,.06)" }} />
        <div aria-hidden style={{ position:"absolute", bottom:-30, left:60, width:120, height:120, borderRadius:"50%", background:"rgba(245,158,11,.12)" }} />

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Avatar + greeting */}
          <div className="slide-up" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%",
                background: "linear-gradient(135deg,#f59e0b,#ec4899)",
                zIndex: 0,
              }} />
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={`${user.name}'s avatar`}
                style={{
                  position: "relative", zIndex: 1,
                  width: 72, height: 72, borderRadius: "50%",
                  border: "4px solid white", objectFit: "cover",
                }}
              />
              {/* Online dot */}
              <span aria-hidden style={{
                position:"absolute", bottom:2, right:2, zIndex:2,
                width:14, height:14, borderRadius:"50%",
                background:"#22c55e", border:"3px solid white"
              }} />
            </div>

            <div>
              <p style={{ color: "rgba(255,255,255,.75)", fontSize: `${0.9 * fs}rem`, fontWeight: 700, marginBottom: 4 }}>
                Welcome back! 👋
              </p>
              <h1 style={{
                color: "#fff", fontFamily: "var(--font-display)",
                fontSize: `${1.75 * fs}rem`, fontWeight: 900,
                lineHeight: 1.15, margin: 0,
              }}>
                {user.name}
              </h1>

              {/* XP Bar */}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  background: "rgba(255,255,255,.2)", color: "#fff",
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: `${0.8 * fs}rem`, padding: "2px 10px", borderRadius: 999,
                }}>
                  Lv.{user.level || 1}
                </span>
                <div style={{ flex: 1, background: "rgba(255,255,255,.25)", height: 12, borderRadius: 999, overflow: "hidden", position: "relative" }}>
                  <div
                    className="xp-shimmer"
                    role="progressbar"
                    aria-valuenow={xpProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${xpProgress} of 100 XP`}
                    style={{
                      position: "relative", overflow: "hidden",
                      height: "100%", borderRadius: 999,
                      width: `${xpProgress}%`,
                      background: "linear-gradient(90deg,#f59e0b,#fbbf24)",
                      transition: "width 1s cubic-bezier(.34,1.56,.64,1)",
                    }}
                  />
                </div>
                <span style={{ color: "rgba(255,255,255,.8)", fontSize: `${0.8 * fs}rem`, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {xpProgress}/100 XP
                </span>
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <nav aria-label="Quick navigation" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10, paddingBottom: 28,
          }}>
            {QUICK_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                className="bounce-in"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,.15)",
                  backdropFilter: "blur(8px)",
                  border: "2px solid rgba(255,255,255,.25)",
                  borderRadius: 18, padding: "14px 8px",
                  textDecoration: "none", color: "#fff",
                  transition: "transform .15s, background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.28)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
              >
                <span style={{ fontSize: `${1.8 * fs}rem`, lineHeight: 1 }} aria-hidden>{l.icon}</span>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: `${0.72 * fs}rem`, textAlign: "center", lineHeight: 1.3,
                }}>
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LEARNING PATH
      ══════════════════════════════════════════ */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 100px" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: `${1.35 * fs}rem`, color: "var(--clr-text)",
          marginBottom: 32, display: "flex", alignItems: "center", gap: 10,
        }}>
          <span aria-hidden>🗺️</span> Your Learning Path
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {LEARNING_PATH.map((unit, unitIndex) => {
            const activeUnitIdx = LEARNING_PATH.findIndex(u => !completedUnits.includes(u.unit.toString()));
            const effectiveActive = activeUnitIdx === -1 ? LEARNING_PATH.length - 1 : activeUnitIdx;
            const isLocked = unitIndex > effectiveActive;

            return (
              <section
                key={unit.unit}
                aria-label={`Unit ${unit.unit}: ${unit.title}`}
                style={{ opacity: isLocked ? 0.45 : 1, filter: isLocked ? "grayscale(1)" : "none", pointerEvents: isLocked ? "none" : "auto" }}
              >
                {/* Unit header card */}
                <div style={{
                  background: isDark ? unit.darkColor : unit.color,
                  borderRadius: "var(--radius-2xl)",
                  padding: "20px 24px",
                  marginBottom: 32,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: `0 8px 24px ${unit.color}44`,
                  border: `3px solid ${unit.lightColor}`,
                }}>
                  <div>
                    <p style={{
                      color: "rgba(255,255,255,.75)", fontFamily: "var(--font-display)",
                      fontWeight: 800, fontSize: `${0.78 * fs}rem`,
                      letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4,
                    }}>
                      Unit {unit.unit}
                    </p>
                    <h3 style={{
                      color: "#fff", fontFamily: "var(--font-display)",
                      fontWeight: 900, fontSize: `${1.3 * fs}rem`, margin: 0,
                    }}>
                      {unit.title}
                    </h3>
                  </div>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: "rgba(255,255,255,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: `${2.2 * fs}rem`,
                  }} aria-hidden>
                    {unit.emoji}
                  </div>
                </div>

                {/* Lessons */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  <div className="path-line" aria-hidden />

                  {unit.lessons.map((lesson, li) => {
                    const isCheckpoint = lesson.type === "checkpoint";
                    const size = isCheckpoint ? 110 : 88;

                    return (
                      <div
                        key={lesson.id}
                        className="bounce-in"
                        style={{ animationDelay: `${li * 0.12}s`, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
                      >
                        <Link
                          href={`/learn/${lesson.id}`}
                          aria-label={`${lesson.title}: ${lesson.desc}`}
                          className="lesson-btn"
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            width: size, height: size, borderRadius: "50%",
                            background: isCheckpoint
                              ? "linear-gradient(135deg,#f59e0b,#fbbf24)"
                              : isDark ? "var(--clr-surface)" : "#fff",
                            border: isCheckpoint
                              ? `4px solid #d97706`
                              : `4px solid ${unit.lightColor}`,
                            boxShadow: isCheckpoint
                              ? `0 8px 0 #d97706, 0 12px 24px rgba(245,158,11,.35)`
                              : `0 6px 0 ${unit.lightColor}, var(--shadow-card)`,
                            textDecoration: "none",
                            cursor: "pointer",
                            transition: "transform .15s, box-shadow .15s",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = "scale(1.08) translateY(-3px)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = "";
                          }}
                          onMouseDown={e => {
                            e.currentTarget.style.transform = "scale(.96) translateY(4px)";
                            e.currentTarget.style.boxShadow = isCheckpoint
                              ? `0 2px 0 #d97706`
                              : `0 2px 0 ${unit.lightColor}`;
                          }}
                          onMouseUp={e => {
                            e.currentTarget.style.transform = "";
                          }}
                        >
                          <span style={{ fontSize: `${(isCheckpoint ? 2.4 : 2) * fs}rem`, lineHeight: 1 }} aria-hidden>
                            {lesson.icon}
                          </span>
                        </Link>

                        {/* Label bubble */}
                        <div style={{
                          background: isDark ? "var(--clr-surface)" : "#fff",
                          border: `2px solid ${unit.lightColor}`,
                          borderRadius: 14,
                          padding: "8px 16px",
                          textAlign: "center",
                          boxShadow: "var(--shadow-card)",
                          maxWidth: 200,
                        }}>
                          <p style={{
                            fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: `${0.9 * fs}rem`, color: "var(--clr-text)", margin: 0,
                          }}>
                            {lesson.title}
                          </p>
                          <p className="readable" style={{
                            fontSize: `${0.75 * fs}rem`, color: "var(--clr-muted)", margin: "2px 0 0",
                          }}>
                            {lesson.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* ══════════════════════════════════════════
          PRACTICE FAB
      ══════════════════════════════════════════ */}
      <div style={{ position: "fixed", bottom: 28, right: 24, zIndex: 50 }}>
        <Link href="/practice" aria-label="Go to practice">
          <button style={{
            width: 68, height: 68, borderRadius: "50%",
            background: "linear-gradient(135deg,#6c3fc5,#f59e0b)",
            border: "none", cursor: "pointer",
            fontSize: 30, color: "#fff",
            boxShadow: "0 8px 0 rgba(108,63,197,.4), 0 12px 32px rgba(108,63,197,.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "")}
          >
            💪
          </button>
        </Link>
      </div>
    </div>
  );
}