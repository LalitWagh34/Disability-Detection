'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login, isLoading: authLoading } = useAuth();
    const { theme, toggle } = useTheme();
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch on the theme toggle
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalLoading(true);
        setError('');
        const success = await login(email);
        if (success) {
            router.push('/');
        } else {
            setError('User not found. Please check your email or sign up.');
        }
        setLocalLoading(false);
    };

    return (
        <div className="min-h-screen flex font-sans selection:bg-violet-200 selection:text-violet-900 dark:selection:bg-violet-900 dark:selection:text-violet-100">
            
            {/* ── Styles & Animations ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
                * { font-family: 'Inter', sans-serif; }
                h1, h2, h3, .font-display { font-family: 'Nunito', sans-serif; }
                
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
                @keyframes blob { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
                
                .float { animation: float 6s ease-in-out infinite; }
                .animate-blob { animation: blob 8s infinite alternate; }
            `}</style>

            {/* ════ LEFT PANEL: THE SHOWCASE (Always Vibrant/Dark) ════ */}
            <div className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between p-12 text-white bg-[#06080f]">
                {/* Deep Animated Background */}
                <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
                    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-violet-600/40 blur-[120px] animate-blob" />
                    <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] rounded-full bg-teal-500/30 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/30 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
                </div>
                
                {/* Noise overlay for premium texture */}
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }} />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-black bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                            L
                        </div>
                        <span className="font-black text-2xl tracking-tight font-display">LearnAble</span>
                    </Link>
                </div>

                {/* Floating 3D/Glassmorphic Element */}
                <div className="relative z-10 flex-1 flex items-center justify-center mt-10">
                    <div className="relative w-full max-w-sm float">
                        {/* Glowing backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-teal-400 rounded-3xl blur-xl opacity-40" />
                        
                        {/* Glass Card */}
                        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                                    🦉
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg font-display">Owly AI Tutor</p>
                                    <p className="text-white/60 text-sm">Real-time analysis active</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[85%] rounded-full relative">
                                        <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite]" style={{ transform: "skewX(-20deg)" }} />
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest">
                                    <span>Screening Accuracy</span>
                                    <span className="text-teal-400">98.4%</span>
                                </div>
                            </div>
                        </div>

                        {/* Secondary floating badge */}
                        <div className="absolute -bottom-6 -right-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="text-white text-xs font-bold">10,000+ Kids</p>
                                <p className="text-white/50 text-[10px] uppercase tracking-wider">Screened securely</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 leading-[1.1] font-display text-white">
                        Every child learns<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-400">differently.</span>
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed max-w-md">
                        AI-powered screening for Dyslexia, Dysgraphia & Dyscalculia — available in English, Hindi, and Marathi.
                    </p>
                </div>
            </div>

            {/* ════ RIGHT PANEL: THE FORM (Adapts to Light/Dark Mode) ════ */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-white dark:bg-[#0b0f19] transition-colors duration-300">
                
                {/* Top Actions */}
                <div className="absolute top-6 left-6 lg:left-8 right-6 lg:right-8 flex justify-between items-center w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
                    <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Home
                    </Link>
                    
                    {mounted && (
                        <button
                            onClick={toggle}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                    )}
                </div>

                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center justify-center gap-3 font-black text-2xl text-slate-900 dark:text-white mb-10 font-display">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">L</div>
                        LearnAble
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 font-display">Welcome back</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Log in to continue your learning journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-[#0b0f19] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                                <a href="#" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-[#0b0f19] transition-all"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-start gap-3 animate-[fadeUp_0.3s_ease-out]">
                                <span className="text-red-500 mt-0.5">⚠️</span>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={localLoading || authLoading}
                            className="group relative w-full h-14 mt-4 rounded-2xl overflow-hidden shadow-xl shadow-violet-500/20 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                            
                            {!localLoading && !authLoading && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            )}
                            
                            <div className="relative flex items-center justify-center gap-2 h-full text-white font-bold text-base">
                                {localLoading || authLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}