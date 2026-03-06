"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { db } from "@/db/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ParentDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fetch all assessments for detailed report
    const assessments = useLiveQuery(() => db.assessments.where('userId').equals(user?.id || 0).toArray());

    const handlePinSubmit = () => {
        if (pin === "1234") {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect PIN. Default is 1234.");
            setPin("");
        }
    };

    if (!user) return <div className="p-8">Please log in first.</div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
                    <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Parent Gate 🔒</h1>
                    <p className="text-slate-500 mb-6">Enter PIN to access settings (Default: 1234)</p>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="text-center text-3xl tracking-widest w-full p-4 border border-slate-200 rounded-xl mb-6 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
                        placeholder="••••"
                        maxLength={4}
                    />
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => router.back()} className="flex-1">Back</Button>
                        <Button onClick={handlePinSubmit} className="flex-1">Enter</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Parent Dashboard</h1>
                        <p className="text-slate-500">Monitoring progress for: <span className="font-bold text-violet-600">{user.name}</span></p>
                    </div>
                    <Button variant="secondary" onClick={() => router.push('/dashboard')}>Exit to Child Mode</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">Total XP</h3>
                        <div className="text-4xl font-bold text-violet-600">{user.xp || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">Current Level</h3>
                        <div className="text-4xl font-bold text-blue-500">{user.level || 1}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-slate-500 text-sm font-bold uppercase mb-2">Learning Streak</h3>
                        <div className="text-4xl font-bold text-orange-500">{user.streak || 0} Days</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Assessment History */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-6">Assessment History</h2>
                        <div className="space-y-4">
                            {assessments?.map((a, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div>
                                        <div className="font-bold capitalize">{a.type} Test</div>
                                        <div className="text-sm text-slate-500">{new Date(a.date).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${a.risk === 'High' ? 'bg-red-100 text-red-600' :
                                            a.risk === 'Moderate' ? 'bg-orange-100 text-orange-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        {a.risk} Risk
                                    </span>
                                </div>
                            ))}
                            {(!assessments || assessments.length === 0) && <p className="text-slate-500">No assessments taken yet.</p>}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-6">AI Recommendations</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4 items-start">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">💡</div>
                                <div>
                                    <h4 className="font-bold">Focus on Phonics</h4>
                                    <p className="text-sm text-slate-500">Result suggests difficulty with sound-letter correspondence.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">⏰</div>
                                <div>
                                    <h4 className="font-bold">Daily 15-min Practice</h4>
                                    <p className="text-sm text-slate-500">Consistency matches child's learning pace perfectly.</p>
                                </div>
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full mt-6">Email Weekly Report</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
