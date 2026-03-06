"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PracticePage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <Button variant="secondary" onClick={() => router.push('/dashboard')} className="mb-8">
                    ← Back to Dashboard
                </Button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Practice Arena 🏋️</h1>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                        Strengthen your skills with focused training.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dyslexia Practice */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-400 transition-all">
                        <div className="text-4xl mb-4">🗣️</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Phonics</h3>
                        <p className="text-slate-500 mb-6 text-sm">Practice letter sounds and word building.</p>
                        <Link href="/learn/dyslexia_1">
                            <Button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200">Start</Button>
                        </Link>
                    </div>

                    {/* Dysgraphia Practice */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-purple-400 transition-all">
                        <div className="text-4xl mb-4">✍️</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tracing</h3>
                        <p className="text-slate-500 mb-6 text-sm">Improve fine motor control and letter formation.</p>
                        <Link href="/learn/dysgraphia_1">
                            <Button className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200">Start</Button>
                        </Link>
                    </div>

                    {/* Dyscalculia Practice */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-transparent hover:border-green-400 transition-all">
                        <div className="text-4xl mb-4">🏎️</div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Math Race</h3>
                        <p className="text-slate-500 mb-6 text-sm">Speed up your calculations in infinite mode.</p>
                        <Link href="/learn/dyscalculia_1">
                            <Button className="w-full bg-green-100 text-green-700 hover:bg-green-200">Start</Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-indigo-50 dark:bg-slate-800/50 rounded-3xl border border-indigo-100 dark:border-slate-700 text-center">
                    <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">Daily Challenge</h3>
                    <p className="text-indigo-600 dark:text-indigo-300 mb-6">Complete a random game to keep your streak alive!</p>
                    <Button onClick={() => router.push('/learn/dyslexia_1')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg shadow-indigo-500/30">
                        Play Daily Challenge
                    </Button>
                </div>
            </div>
        </div>
    );
}
