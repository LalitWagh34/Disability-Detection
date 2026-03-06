'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';

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

    const fields = [
        { label: 'Full Name', type: 'text', value: name, setter: setName, placeholder: 'Arjun Sharma' },
        { label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
        { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '••••••••' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-fuchsia-600 via-violet-600 to-blue-700 p-16 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-x-20 -translate-y-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full translate-x-10 translate-y-20" />

                <div className="flex items-center gap-2 font-extrabold text-2xl text-white">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">L</div>
                    LearnAble
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                        Start the journey<br />today. 🚀
                    </h2>
                    <p className="text-violet-100 text-lg leading-relaxed mb-8">
                        Free AI assessment + personalised learning games based on your child's unique profile.
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <p className="text-white font-semibold mb-1">15-minute assessment</p>
                        <p className="text-violet-200 text-sm">Covers Dyslexia, Dysgraphia & Dyscalculia in one session. No specialist visit needed to get started.</p>
                    </div>
                </div>

                <p className="text-violet-300 text-xs">© 2025 LearnAble. Free forever for families.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <button
                    onClick={toggle}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div className="w-full max-w-md">
                    <div className="flex lg:hidden items-center gap-2 font-extrabold text-xl text-violet-700 dark:text-violet-400 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold">L</div>
                        LearnAble
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create your account ✨</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">It's free. No credit card needed.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(f => (
                            <div key={f.label}>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                                <input
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    required
                                    value={f.value}
                                    onChange={e => f.setter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Age</label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                min="5" max="100"
                                required
                                value={age}
                                onChange={e => setAge(e.target.value)}
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
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900 mt-2"
                        >
                            {localLoading ? 'Creating Account...' : 'Create Free Account →'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
