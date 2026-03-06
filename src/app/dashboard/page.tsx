"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

const LEARNING_PATH = [
    {
        unit: 1,
        title: "Basics of Language",
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-blue-500",
        lessons: [
            { id: "dyslexia_1", title: "Phonics Adventure", type: "game", icon: "🗣️" },
            { id: "dyslexia_2", title: "Sight Word Safari", type: "game", icon: "🦁" },
            { id: "dyslexia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆" }
        ]
    },
    {
        unit: 2,
        title: "Writing Mastery",
        gradient: "from-purple-500 to-violet-600",
        bg: "bg-purple-500",
        lessons: [
            { id: "dysgraphia_1", title: "Letter Tracer", type: "game", icon: "✍️" },
            { id: "dysgraphia_2", title: "Maze Master", type: "game", icon: "🌀" },
            { id: "dysgraphia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆" }
        ]
    },
    {
        unit: 3,
        title: "Number Sense",
        gradient: "from-green-500 to-emerald-600",
        bg: "bg-green-500",
        lessons: [
            { id: "dyscalculia_1", title: "Math Race", type: "game", icon: "🏎️" },
            { id: "dyscalculia_2", title: "Shape Sorter", type: "game", icon: "🔺" },
            { id: "dyscalculia_checkpoint", title: "Unit Quiz", type: "checkpoint", icon: "🏆" }
        ]
    }
];

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const completedUnits = user?.completedUnits || [];

    const isLessonLocked = () => false; // Unlocked for testing

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Please log in to view your dashboard.</p>
                <Link href="/login" className="text-violet-600 font-semibold hover:underline">Go to Login →</Link>
            </div>
        </div>
    );

    const xpProgress = ((user.xp || 0) % 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 pb-24 transition-colors duration-300">

            {/* ── Sticky Top Bar ── */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-3 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow">L</div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600">LearnAble</span>
                    </Link>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full font-bold text-sm border border-orange-100 dark:border-orange-800">
                            🔥 {user.streak || 0}
                        </div>
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full font-bold text-sm border border-red-100 dark:border-red-800">
                            ❤️ {user.hearts ?? 5}
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full font-bold text-sm border border-blue-100 dark:border-blue-800">
                            💎 {user.gems ?? 0}
                        </div>
                        <button onClick={toggle} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── User Hero ── */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 py-10 px-6">
                <div className="max-w-2xl mx-auto flex items-center gap-5">
                    <img
                        src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg"
                    />
                    <div className="flex-1">
                        <p className="text-violet-200 text-sm font-semibold">Welcome back,</p>
                        <h1 className="text-white text-2xl font-extrabold">{user.name} 👋</h1>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="text-violet-200 text-xs font-semibold">Lv. {user.level || 1}</span>
                            <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                                <div className="h-2 bg-white rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
                            </div>
                            <span className="text-violet-200 text-xs">{xpProgress}/100 XP</span>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="max-w-2xl mx-auto mt-6 grid grid-cols-3 gap-3">
                    {[
                        { label: "Full Report", href: "/report", icon: "📊" },
                        { label: "Profile", href: "/profile", icon: "👤" },
                        { label: "Find Specialist", href: "/specialists", icon: "🏥" },
                        { label: "Parent Area", href: "/parent", icon: "🔒" },
                    ].map(l => (
                        <Link key={l.href} href={l.href}
                            className="flex flex-col items-center gap-1 bg-white/15 hover:bg-white/25 rounded-2xl p-3 transition-all text-white text-center">
                            <span className="text-2xl">{l.icon}</span>
                            <span className="text-xs font-semibold">{l.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Learning Path ── */}
            <div className="max-w-2xl mx-auto px-4 py-12 space-y-16">
                {LEARNING_PATH.map((unit, unitIndex) => (
                    <div key={unit.unit} className={`${unitIndex > (LEARNING_PATH.findIndex(u => !completedUnits.includes(u.unit.toString())) === -1 ? LEARNING_PATH.length - 1 : LEARNING_PATH.findIndex(u => !completedUnits.includes(u.unit.toString()))) ? 'opacity-40 grayscale pointer-events-none' : ''}`}>

                        {/* Unit Header */}
                        <div className={`bg-gradient-to-r ${unit.gradient} text-white p-5 rounded-2xl mb-10 flex justify-between items-center shadow-lg`}>
                            <div>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Unit {unit.unit}</p>
                                <h2 className="text-xl font-extrabold">{unit.title}</h2>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl`}>📚</div>
                        </div>

                        {/* Lesson Bubbles */}
                        <div className="flex flex-col items-center gap-10 relative">
                            {/* Connector line */}
                            <div className="absolute top-6 bottom-6 left-1/2 w-1 -ml-0.5 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full" />

                            {unit.lessons.map((lesson, i) => {
                                const isLocked = isLessonLocked();
                                const isCheckpoint = lesson.type === 'checkpoint';
                                return (
                                    <div key={lesson.id} className="group flex flex-col items-center gap-2 z-10">
                                        <Link
                                            href={isLocked ? '#' : `/learn/${lesson.id}`}
                                            className={`
                                                relative flex items-center justify-center rounded-full shadow-xl
                                                border-b-[6px] active:border-b-0 active:translate-y-1.5 transition-all duration-150
                                                ${isCheckpoint ? 'w-28 h-28' : 'w-20 h-20'}
                                                ${isLocked
                                                    ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                                                    : isCheckpoint
                                                        ? 'bg-amber-400 border-amber-600 hover:bg-amber-300'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                                }
                                            `}
                                        >
                                            <span className={isCheckpoint ? 'text-4xl' : 'text-3xl'}>{lesson.icon}</span>
                                        </Link>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                                            {lesson.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Practice FAB */}
            <div className="fixed bottom-6 right-6 z-30">
                <Link href="/practice">
                    <button className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-3xl shadow-2xl shadow-violet-300/50 dark:shadow-violet-900/50 hover:scale-110 transition-transform flex items-center justify-center">
                        💪
                    </button>
                </Link>
            </div>
        </div>
    );
}
