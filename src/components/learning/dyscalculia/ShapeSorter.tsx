"use client";

import { useState } from "react";
import { ModuleShell } from "../ModuleShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ShapeChallenge {
    id: string;
    targetShapeName: string; // e.g., "Triangle"
    targetShapeIcon: string; // e.g., "🔺"
    options: { id: string; icon: string; isCorrect: boolean }[];
}

const CHALLENGES: ShapeChallenge[] = [
    {
        id: "1",
        targetShapeName: "Triangle",
        targetShapeIcon: "🔺",
        options: [
            { id: "a", icon: "🟥", isCorrect: false },
            { id: "b", icon: "🔺", isCorrect: true },
            { id: "c", icon: "🔵", isCorrect: false }
        ]
    },
    {
        id: "2",
        targetShapeName: "Circle",
        targetShapeIcon: "🔵",
        options: [
            { id: "a", icon: "⭐", isCorrect: false },
            { id: "b", icon: "🟩", isCorrect: false },
            { id: "c", icon: "🔵", isCorrect: true }
        ]
    },
    {
        id: "3",
        targetShapeName: "Square",
        targetShapeIcon: "🟥",
        options: [
            { id: "a", icon: "🟥", isCorrect: true },
            { id: "b", icon: "🔷", isCorrect: false },
            { id: "c", icon: "🔻", isCorrect: false }
        ]
    },
    {
        id: "4",
        targetShapeName: "Star",
        targetShapeIcon: "⭐",
        options: [
            { id: "a", icon: "🟢", isCorrect: false },
            { id: "b", icon: "⭐", isCorrect: true },
            { id: "c", icon: "🟧", isCorrect: false }
        ]
    }
];

import { useGameSounds } from "@/hooks/useGameSounds";

export function ShapeSorter() {
    const { addXp, loseHeart } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const { playCorrect, playWrong, playSuccess } = useGameSounds();

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            playCorrect();
            setFeedback("correct");
            setTimeout(() => {
                if (currentStep < CHALLENGES.length - 1) {
                    setCurrentStep(prev => prev + 1);
                    setFeedback(null);
                } else {
                    playSuccess();
                    finishGame();
                }
            }, 800);
        } else {
            playWrong();
            setFeedback("wrong");
            loseHeart();
            setTimeout(() => setFeedback(null), 800);
        }
    };

    const finishGame = async () => {
        setIsComplete(true);
        await addXp(50);
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-green-500 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🧩</div>
                <h1 className="text-4xl font-bold mb-4">Shape Master!</h1>
                <p className="text-xl opacity-90 mb-8">+50 XP Earned</p>
                <Button onClick={() => router.push("/dashboard")} className="bg-white text-green-600 hover:bg-green-50 text-xl px-8 py-4 rounded-full shadow-xl">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const challenge = CHALLENGES[currentStep];

    return (
        <ModuleShell
            title="Shape Sorter"
            totalSteps={CHALLENGES.length}
            currentStep={currentStep}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center gap-10 w-full max-w-md mx-auto py-8">

                <h2 className="text-2xl text-slate-600 dark:text-slate-300">
                    Find the <span className="font-bold text-indigo-600 dark:text-indigo-400 text-3xl">{challenge.targetShapeName}</span>
                </h2>

                <div className="grid grid-cols-3 gap-6 w-full">
                    <AnimatePresence mode="wait">
                        {challenge.options.map((option, idx) => (
                            <motion.button
                                key={`${currentStep}-${option.id}`}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleAnswer(option.isCorrect)}
                                className={`
                                aspect-square rounded-2xl flex items-center justify-center text-7xl shadow-lg border-b-8 transition-all active:border-b-0 active:translate-y-2
                                bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600
                                ${feedback === 'wrong' ? 'border-red-200' : 'border-slate-200 dark:border-slate-800'}
                            `}
                            >
                                {option.icon}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {feedback === 'correct' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold"
                    >
                        Correct! 🎉
                    </motion.div>
                )}
                {feedback === 'wrong' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-full font-bold"
                    >
                        Oops, try again!
                    </motion.div>
                )}

            </div>
        </ModuleShell>
    );
}
