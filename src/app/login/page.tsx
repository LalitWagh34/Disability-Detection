'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Left panel — decorative */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-fuchsia-700 p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full translate-x-10 translate-y-20" />

                {/* Logo */}
                <div className="flex items-center gap-2 font-extrabold text-2xl text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">L</div>
                    LearnAble
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                        Every child learns<br />differently. 💡
                    </h2>
                    <p className="text-violet-200 text-lg leading-relaxed">
                        AI-powered screening for Dyslexia, Dysgraphia & Dyscalculia — now available in English, Hindi, and Marathi.
                    </p>

                    <div className="mt-10 space-y-3">
                        {["📖 Dyslexia Assessment", "✍️ Dysgraphia Analysis", "🧮 Dyscalculia Screening", "🎮 20+ Game Activities"].map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs text-white">✓</div>
                                <span className="text-white/90 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-violet-300 text-xs">© 2025 LearnAble. Made with ❤️ in India.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Dark mode toggle */}
                <button
                    onClick={toggle}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2 font-extrabold text-xl text-violet-700 dark:text-violet-400 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold">L</div>
                        LearnAble
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome back 👋</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to continue your learning journey.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                                <a href="#" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={localLoading || authLoading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900"
                        >
                            {localLoading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
