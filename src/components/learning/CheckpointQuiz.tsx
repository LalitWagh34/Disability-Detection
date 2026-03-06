"use client";

import { useState } from "react";
import { ModuleShell } from "./ModuleShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct: string;
}

const QUESTIONS: QuizQuestion[] = [
    { id: "1", question: "Which word starts with 'C'?", options: ["Dog", "Cat", "Sun"], correct: "Cat" },
    { id: "2", question: "What is 2 + 2?", options: ["3", "4", "5"], correct: "4" },
    { id: "3", question: "Find the rhyming word for 'Hat'.", options: ["Bat", "Pot", "Sit"], correct: "Bat" },
    { id: "4", question: "Which letter comes after A?", options: ["C", "B", "D"], correct: "B" },
    { id: "5", question: "How many fingers on one hand?", options: ["4", "5", "10"], correct: "5" },
];

export function CheckpointQuiz({ unitId }: { unitId: string }) {
    const { addXp, completeUnit, user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const handleAnswer = (option: string) => {
        if (option === QUESTIONS[currentStep].correct) {
            setScore(prev => prev + 1);
        }

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishQuiz(score + (option === QUESTIONS[currentStep].correct ? 1 : 0));
        }
    };

    const finishQuiz = async (finalScore: number) => {
        setIsComplete(true);
        const passed = finalScore >= 4; // 80% pass rate

        if (passed) {
            await addXp(100);
            await completeUnit(unitId); // Mark CURRENT unit as complete
        }
    };

    if (isComplete) {
        const passed = score >= 4;
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen ${passed ? 'bg-green-600' : 'bg-slate-800'} text-white p-8 text-center animate-fade-in`}>
                <div className="text-6xl mb-4 animate-bounce">{passed ? '🏆' : '😢'}</div>
                <h1 className="text-4xl font-bold mb-4">{passed ? 'Unit Complete!' : 'Try Again'}</h1>
                <p className="text-xl opacity-90 mb-8">Score: {score}/{QUESTIONS.length}</p>
                {passed && <p className="text-lg font-bold mb-8">+100 XP & Next Unit Unlocked!</p>}

                <Button onClick={() => router.push("/dashboard")} className="bg-white text-slate-900 hover:bg-slate-100 text-xl px-8 py-4 rounded-full shadow-xl">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <ModuleShell
            title={`Unit ${unitId} Checkpoint`}
            totalSteps={QUESTIONS.length}
            currentStep={currentStep}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">
                    {QUESTIONS[currentStep].question}
                </h2>

                <div className="grid grid-cols-1 gap-4 w-full">
                    {QUESTIONS[currentStep].options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="py-4 px-6 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900 border-2 border-transparent hover:border-violet-500 text-lg font-medium transition-all"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </ModuleShell>
    );
}
