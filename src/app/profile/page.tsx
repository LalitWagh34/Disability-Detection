"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className={`rounded-2xl p-4 ${color}`}>
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{value}</p>
        </div>
    );
}

function AssessmentCard({ title, badge, badgeColor, result, onRetake, onStart, accentColor }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
            </div>

            {result ? (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Score</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{result.score}/{result.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Risk Level</span>
                        <span className={`font-bold ${result.risk === 'High' ? 'text-red-500' : result.risk === 'Moderate' ? 'text-amber-500' : 'text-green-500'}`}>
                            {result.risk}
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${(result.score / result.total) * 100}%`, backgroundColor: accentColor }} />
                    </div>
                    <button onClick={onRetake} className="w-full mt-3 text-sm py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                        Retake Test
                    </button>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-3">Not started yet</p>
                    <button onClick={onStart} className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90" style={{ backgroundColor: accentColor }}>
                        Start Assessment
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const router = useRouter();

    const assessments = useLiveQuery(
        () => (user ? db.assessments.where("userId").equals(user.id).toArray() : []),
        [user]
    ) || [];

    const handleDeleteData = async () => {
        if (!user) return;
        if (confirm("Are you sure? This will delete your account and all history permanently.")) {
            await db.users.delete(user.id);
            await db.assessments.where("userId").equals(user.id).delete();
            logout();
            router.push("/");
        }
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <p className="text-gray-500 dark:text-gray-400">
                Please <Link href="/login" className="text-violet-600 font-semibold underline">log in</Link> to view your profile.
            </p>
        </div>
    );

    const latest = (type: string) =>
        assessments.filter(a => a.type === type).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const dy = latest('dyslexia');
    const dg = latest('dysgraphia');
    const dc = latest('dyscalculia');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 transition-colors duration-300">

            {/* ── Header ── */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between shadow-sm">
                <Link href="/dashboard" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                    ← Dashboard
                </Link>
                <span className="font-extrabold text-gray-900 dark:text-white">Profile</span>
                <button onClick={toggle} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* ── Profile Card ── */}
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
                    <div className="flex items-center gap-5">
                        <img
                            src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-20 h-20 rounded-2xl border-4 border-white/30 shadow-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-extrabold">{user.name}</h1>
                            <p className="text-violet-200 text-sm">{user.email}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Age {user.age}</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Level {user.level || 1}</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">🔥 {user.streak || 0} day streak</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="XP Earned" value={`${user.xp || 0}`} color="bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" />
                    <StatCard label="Hearts" value={`❤️ ${user.hearts ?? 5}`} color="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300" />
                    <StatCard label="Gems" value={`💎 ${user.gems ?? 0}`} color="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" />
                </div>

                {/* ── Assessments ── */}
                <div>
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Assessment Results</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AssessmentCard title="Dyslexia" badge="Reading" badgeColor="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" result={dy} onRetake={() => router.push('/assessment/dyslexia')} onStart={() => router.push('/assessment/dyslexia')} accentColor="#7c3aed" />
                        <AssessmentCard title="Dysgraphia" badge="Writing" badgeColor="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" result={dg} onRetake={() => router.push('/assessment/dysgraphia')} onStart={() => router.push('/assessment/dysgraphia')} accentColor="#0d9488" />
                        <AssessmentCard title="Dyscalculia" badge="Math" badgeColor="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" result={dc} onRetake={() => router.push('/assessment/dyscalculia')} onStart={() => router.push('/assessment/dyscalculia')} accentColor="#ea580c" />
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => router.push('/report')}
                        className="py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all shadow-lg"
                    >
                        📊 View Full Report
                    </button>
                    <button
                        onClick={() => router.push('/specialists')}
                        className="py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold hover:opacity-90 transition-all shadow-lg"
                    >
                        🏥 Find Specialists
                    </button>
                    <button
                        onClick={() => router.push('/parent')}
                        className="py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        🔒 Parent Dashboard
                    </button>
                </div>

                {/* ── Danger zone ── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Account</h3>
                    <div className="flex gap-3 mt-3">
                        <button onClick={logout} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Sign Out
                        </button>
                        <button onClick={handleDeleteData} className="flex-1 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
