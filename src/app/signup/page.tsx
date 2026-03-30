'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

// ─── Custom Real-Life Dyslexia/Dysgraphia Illustration ───────────────
function LearningDifferenceVisual() {
    return (
        <div className="relative w-full h-full min-h-[260px] max-h-[320px] flex items-center justify-center p-2 group mx-auto">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-teal-500/20 rounded-[40px] blur-3xl group-hover:blur-[40px] transition-all duration-700" />
            
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] lg:max-w-[320px] h-auto drop-shadow-2xl hover:-translate-y-2 transition-transform duration-700 ease-out z-10">
                
                {/* Lined Paper (Tilted) */}
                <g transform="translate(180, 200) rotate(-8) translate(-180, -200)">
                    <rect x="50" y="80" width="280" height="240" rx="12" fill="#ffffff" className="drop-shadow-lg" />
                    {/* Paper lines */}
                    {[120, 160, 200, 240, 280].map((y, i) => (
                        <line key={i} x1="50" y1={y} x2="330" y2={y} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray={i === 1 || i === 3 ? "4 4" : "none"} opacity="0.4" />
                    ))}
                    {/* Red margin line */}
                    <line x1="90" y1="80" x2="90" y2="320" stroke="#fca5a5" strokeWidth="2" opacity="0.5" />
                    
                    {/* Dysgraphia / Handwriting Representation */}
                    {/* Wobbly 'b' and 'd' */}
                    <path d="M 120 110 C 120 140, 125 150, 125 160 C 125 150, 140 140, 145 150 C 150 160, 135 165, 125 160" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M 180 115 C 180 145, 175 155, 175 165 C 175 155, 160 145, 155 155 C 150 165, 165 170, 175 165" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
                    
                    {/* Correction / Empathy mark */}
                    <path d="M 145 175 Q 150 190 165 180" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
                    <text x="145" y="195" fill="#ef4444" fontSize="14" fontFamily="Nunito, sans-serif" fontWeight="bold" opacity="0.8">b or d?</text>

                    {/* Dyslexia / Reading Representation (was vs saw) */}
                    <text x="110" y="235" fill="#0f172a" fontSize="32" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="2">was</text>
                    <path d="M 180 225 Q 195 210 210 225" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeLinecap="round" markerEnd="url(#arrow)" />
                    <text x="225" y="235" fill="#0f172a" fontSize="32" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="2" opacity="0.6">saw</text>
                </g>

                {/* Dyscalculia / Time Representation (Floating) */}
                <g transform="translate(280, 90) rotate(15)" className="animate-[float_6s_ease-in-out_infinite]">
                    <circle cx="0" cy="0" r="45" fill="white" className="drop-shadow-xl" />
                    <circle cx="0" cy="0" r="38" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    {/* Scrambled numbers on clock */}
                    <text x="-8" y="-20" fill="#0f172a" fontSize="12" fontWeight="bold">7</text>
                    <text x="18" y="-5" fill="#0f172a" fontSize="12" fontWeight="bold">2</text>
                    <text x="15" y="25" fill="#0f172a" fontSize="12" fontWeight="bold">9</text>
                    <text x="-25" y="15" fill="#0f172a" fontSize="12" fontWeight="bold">4</text>
                    {/* Clock hands */}
                    <line x1="0" y1="0" x2="-15" y2="-15" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="20" y2="5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="4" fill="#0f172a" />
                </g>

                {/* Floating Pencil */}
                <g transform="translate(240, 280) rotate(-45)" className="animate-[float_5s_ease-in-out_infinite_1s]">
                    <rect x="0" y="0" width="80" height="16" rx="4" fill="#fbbf24" className="drop-shadow-md" />
                    <polygon points="0,0 0,16 -20,8" fill="#fde68a" />
                    <polygon points="-15,6 -15,10 -20,8" fill="#475569" />
                    <rect x="65" y="0" width="15" height="16" rx="4" fill="#f43f5e" />
                    <rect x="60" y="0" width="8" height="16" fill="#cbd5e1" />
                </g>

                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}

export default function SignupPage() {
    const { signup, isLoading: authLoading } = useAuth();
    const { theme, toggle } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        setError('');
        const success = await signup({
            name,
            email,
            age: parseInt(age, 10),
            password,
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        });
        if (success) {
            router.push('/');
        } else {
            setError('This email may already be registered. Try logging in.');
        }
        setLocalLoading(false);
    };

    return (
        <div className="min-h-[100dvh] relative flex items-center justify-center overflow-hidden bg-[#fafcff] dark:bg-[#06080f] font-sans transition-colors duration-500 selection:bg-violet-200 selection:text-violet-900 dark:selection:bg-violet-900 dark:selection:text-violet-100 p-4">
            
            {/* ── Styles & Animations ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
                * { font-family: 'Inter', sans-serif; }
                h1, h2, h3, .font-display { font-family: 'Nunito', sans-serif; }
                
                @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
                @keyframes blob { 0%, 100% { transform: scale(1) translate(0px, 0px); } 50% { transform: scale(1.05) translate(10px, -10px); } }
                
                .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
            `}</style>

            {/* ════ DYNAMIC BACKGROUND ════ */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-200/50 dark:bg-violet-900/20 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen transition-colors duration-700" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-teal-200/50 dark:bg-teal-900/20 blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen transition-colors duration-700" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
            </div>

            {/* ════ TOP NAVIGATION (Tighter Padding) ════ */}
            <div className="absolute top-0 w-full px-6 py-4 lg:px-8 flex justify-between items-center z-20">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                        L
                    </div>
                    <span className="font-black text-lg tracking-tight font-display text-slate-900 dark:text-white transition-colors">
                        LearnAble
                    </span>
                </Link>
                
                {mounted && (
                    <button
                        onClick={toggle}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                )}
            </div>

            {/* ════ MAIN CONTAINER (Scaled Down) ════ */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[32px] shadow-2xl dark:shadow-violet-900/10 overflow-hidden mt-10 lg:mt-8">
                
                {/* ── LEFT PANEL: Custom Illustration & Copy ── */}
                <div className="hidden lg:flex w-1/2 flex-col justify-between p-8 lg:p-10 relative border-r border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-800/40 dark:to-slate-900/10">
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[11px] font-bold mb-4 border border-violet-200 dark:border-violet-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            Free AI Assessment
                        </div>
                        <h2 className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-[1.1] font-display">
                            Start the journey<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500">today.</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                            Identify early signs of learning differences through fun games.
                        </p>
                    </div>

                    {/* The Custom Visual (Shrunk down) */}
                    <div className="flex-1 flex items-center justify-center -my-2 lg:-my-4">
                        <LearningDifferenceVisual />
                    </div>

                    <div className="relative z-10">
                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 lg:p-5 border border-white/60 dark:border-slate-700/50 shadow-sm">
                            <p className="text-slate-900 dark:text-white text-sm font-bold mb-1">15-minute screening</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Covers Dyslexia, Dysgraphia & Dyscalculia in one session. Generates a personalized path instantly.</p>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: The Form ── */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
                    
                    <div className="mb-6 text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 font-display">Create account</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">No credit card needed. Free forever for families.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5 w-full max-w-[380px] mx-auto lg:mx-0">
                        
                        {/* Name Input */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Arjun Sharma"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Age & Password Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1 space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1">Age</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        min="4" max="100"
                                        required
                                        value={age}
                                        onChange={e => setAge(e.target.value)}
                                        className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="col-span-2 space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide pl-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-2 animate-[fadeUp_0.3s_ease-out]">
                                <span className="text-red-500 dark:text-red-400 text-xs mt-0.5">⚠️</span>
                                <p className="text-xs font-medium text-red-600 dark:text-red-300 leading-snug">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={localLoading || authLoading}
                            className="group relative w-full h-12 mt-4 rounded-xl overflow-hidden shadow-lg shadow-fuchsia-500/20 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600" />
                            
                            {!localLoading && !authLoading && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            )}
                            
                            <div className="relative flex items-center justify-center gap-2 h-full text-white font-bold text-sm">
                                {localLoading || authLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Free Account <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-700/50 text-center">
                        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}