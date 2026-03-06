"use client";

import { useState } from "react";
import { ModuleShell } from "../ModuleShell";
import { Button } from "@/components/ui/Button";
import { CanvasDraw } from "@/components/assessment/CanvasDraw";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface LetterChallenge {
    id: string;
    letter: string;
    guideImage?: string; // Could be a background image path for tracing
}

const CHALLENGES: LetterChallenge[] = [
    { id: "1", letter: "A" },
    { id: "2", letter: "B" },
    { id: "3", letter: "C" },
    { id: "4", letter: "D" },
    { id: "5", letter: "E" },
];

export function TracingGame() {
    const { addXp, user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [drawingData, setDrawingData] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const handleNext = async () => {
        // Validation: Must have drawn something
        if (!drawingData || drawingData.length < 20) return;

        if (currentStep < CHALLENGES.length - 1) {
            setDrawingData(null); // Clear for next step (CanvasDraw needs to handle this internally via key or ref)
            setCurrentStep(prev => prev + 1);
        } else {
            await finishGame();
        }
    };

    const finishGame = async () => {
        setIsComplete(true);
        await addXp(50);
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">✍️</div>
                <h1 className="text-4xl font-bold mb-4">Great Writing!</h1>
                <p className="text-xl opacity-90 mb-8">+50 XP Earned</p>
                <Button onClick={() => router.push("/dashboard")} className="bg-white text-purple-600 hover:bg-purple-50 text-xl px-8 py-4 rounded-full shadow-xl">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const challenge = CHALLENGES[currentStep];

    return (
        <ModuleShell
            title="Letter Tracer"
            totalSteps={CHALLENGES.length}
            currentStep={currentStep}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto" key={currentStep}>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    Trace the letter: <span className="text-6xl font-serif text-purple-600 ml-4">{challenge.letter}</span>
                </h2>

                <div className="w-full relative">
                    {/* Background Guide Letter (faint) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                        <span className="text-[200px] font-sans font-bold text-slate-900">{challenge.letter}</span>
                    </div>

                    <div className="border-4 border-dashed border-purple-200 rounded-3xl overflow-hidden bg-white/50 relative z-10">
                        <CanvasDraw
                            onCapture={setDrawingData}
                            label="Draw inside the box"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleNext}
                    disabled={!drawingData}
                    className="w-full py-4 text-xl bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg mt-4"
                >
                    {currentStep === CHALLENGES.length - 1 ? "Finish" : "Next Letter"}
                </Button>
            </div>
        </ModuleShell>
    );
}
