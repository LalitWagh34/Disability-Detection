"use client";

import { useState, useEffect, useCallback } from "react";
import { ModuleShell } from "../ModuleShell"; // Import ModuleShell
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface MathChallenge {
    id: string;
    question: string;
    answer: number;
    options: number[];
}

export function MathRace() {
    const { addXp, loseHeart, user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [challenge, setChallenge] = useState<MathChallenge | null>(null);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [gameOver, setGameOver] = useState(false);

    // Dynamic Challenge Generator
    const generateChallenge = useCallback((level: number): MathChallenge => {
        const operations = level < 5 ? ['+'] : level < 10 ? ['+', '-'] : ['+', '-', '*'];
        const op = operations[Math.floor(Math.random() * operations.length)];

        let num1 = Math.floor(Math.random() * (level * 2)) + 1;
        let num2 = Math.floor(Math.random() * (level * 2)) + 1;

        // Ensure positive result for subtraction
        if (op === '-' && num1 < num2) [num1, num2] = [num2, num1];

        let answer = 0;
        if (op === '+') answer = num1 + num2;
        if (op === '-') answer = num1 - num2;
        if (op === '*') {
            // Keep multiplication simple
            num1 = Math.floor(Math.random() * 5) + 1;
            num2 = Math.floor(Math.random() * 5) + 1;
            answer = num1 * num2;
        }

        // Generate Options
        const options = new Set<number>();
        options.add(answer);
        while (options.size < 3) {
            const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const fake = answer + offset;
            if (fake >= 0 && fake !== answer) options.add(fake);
        }

        return {
            id: Math.random().toString(),
            question: `${num1} ${op} ${num2}`,
            answer,
            options: Array.from(options).sort(() => Math.random() - 0.5)
        };
    }, []);

    // Initialize first challenge
    useEffect(() => {
        setChallenge(generateChallenge(1));
    }, [generateChallenge]);

    const handleAnswer = async (selected: number) => {
        if (!challenge) return;

        if (selected === challenge.answer) {
            setFeedback("correct");
            setTimeout(async () => {
                const nextStep = currentStep + 1;
                setCurrentStep(nextStep);
                setScore(prev => prev + 10);

                // Increase difficulty every 5 steps
                const difficulty = Math.floor(nextStep / 5) + 1;
                setChallenge(generateChallenge(difficulty));
                setFeedback(null);
            }, 500);
        } else {
            setFeedback("wrong");
            await loseHeart();

            // Check if hearts are depleted (local check for immediate feedback, though context handles DB)
            if ((user?.hearts ?? 5) <= 1) {
                setTimeout(() => setGameOver(true), 800);
            } else {
                setTimeout(() => {
                    setFeedback(null);
                    // Generate new question to prevent spamming guess
                    setChallenge(generateChallenge(Math.floor(currentStep / 5) + 1));
                }, 800);
            }
        }
    };

    const handleExit = async () => {
        if (score > 0) {
            await addXp(score);
        }
        router.push("/dashboard");
    };

    if (gameOver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4">⛽</div>
                <h1 className="text-4xl font-bold mb-4">Out of Fuel!</h1>
                <p className="text-xl opacity-90 mb-8">You scored {score} points</p>
                <div className="flex gap-4">
                    <Button onClick={handleExit} className="bg-white text-slate-900 hover:bg-slate-100 text-xl px-8 py-4 rounded-full shadow-xl">
                        Back to Garage
                    </Button>
                </div>
            </div>
        );
    }

    if (!challenge) return <div className="p-10 text-center">Loading Engine...</div>;

    return (
        <ModuleShell
            title={`Math Race - Lap ${currentStep + 1}`}
            totalSteps={100} // Arbitrary high number for "infinite" feel visual
            currentStep={currentStep}
            onExit={handleExit}
        >
            <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto relative">

                {/* Visual Track */}
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-3xl relative overflow-hidden flex items-center px-8 border-b-4 border-slate-200 dark:border-slate-600">
                    <motion.div
                        animate={{ left: `${(currentStep % 10) * 10}%` }} // Loops every 10 steps visually
                        className="absolute text-5xl transition-all duration-500 ease-in-out"
                    >
                        🏎️
                    </motion.div>

                    {/* Passing scenery effect */}
                    <motion.div
                        animate={{ x: [0, -100] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute bottom-2 left-0 font-bold text-slate-300 dark:text-slate-600 opacity-50 flex gap-20"
                    >
                        <span>🌲</span><span>🌵</span><span>🏢</span><span>🌲</span><span>🌵</span>
                    </motion.div>
                </div>

                {/* Question Card */}
                <div className={`
                    w-full py-12 rounded-3xl shadow-xl flex items-center justify-center
                    transition-colors duration-300
                    ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900' : feedback === 'wrong' ? 'bg-red-100 dark:bg-red-900' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}
                `}>
                    <h2 className={`text-6xl font-bold ${feedback === 'correct' ? 'text-green-600 dark:text-green-300' : feedback === 'wrong' ? 'text-red-600 dark:text-red-300' : 'text-slate-800 dark:text-white'}`}>
                        {challenge.question}
                    </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-3 gap-4 w-full">
                    {challenge.options.map((opt, idx) => (
                        <button
                            key={`${challenge.id}-${idx}`}
                            onClick={() => handleAnswer(opt)}
                            className="h-24 rounded-2xl bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 active:border-b-0 active:translate-y-1 shadow-md text-3xl font-bold text-slate-700 dark:text-slate-200 hover:scale-105 transition-all"
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-4">
                    Distance: {score}m
                </div>
            </div>
        </ModuleShell>
    );
}
