"use client";

import { useState } from "react";
import { ModuleShell } from "../ModuleShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface WordChallenge {
    id: string;
    word: string;
    image: string; // Emoji for now
    scrambled: string[];
}

const CHALLENGES: WordChallenge[] = [
    { id: "1", word: "CAT", image: "🐱", scrambled: ["T", "A", "C"] },
    { id: "2", word: "DOG", image: "🐶", scrambled: ["G", "O", "D"] },
    { id: "3", word: "SUN", image: "☀️", scrambled: ["N", "U", "S"] },
    { id: "4", word: "BOOK", image: "📖", scrambled: ["O", "K", "B", "O"] },
    { id: "5", word: "SMILE", image: "😊", scrambled: ["I", "L", "S", "E", "M"] },
];

export function PhonicsGame() {
    const { addXp, loseHeart, user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
    const [availableLetters, setAvailableLetters] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    // Initialize first challenge
    if (currentStep < CHALLENGES.length && availableLetters.length === 0 && selectedLetters.length === 0 && !feedback) {
        setAvailableLetters([...CHALLENGES[currentStep].scrambled]);
    }

    const handleSelectLetter = (letter: string, index: number) => {
        setSelectedLetters([...selectedLetters, letter]);
        const newAvailable = [...availableLetters];
        newAvailable.splice(index, 1);
        setAvailableLetters(newAvailable);
    };

    const handleRemoveLetter = (letter: string, index: number) => {
        setAvailableLetters([...availableLetters, letter]);
        const newSelected = [...selectedLetters];
        newSelected.splice(index, 1);
        setSelectedLetters(newSelected);
    };

    const checkAnswer = () => {
        const currentChallenge = CHALLENGES[currentStep];
        const formedWord = selectedLetters.join("");

        if (formedWord === currentChallenge.word) {
            setFeedback("correct");
            // Sound effect here
            setTimeout(() => {
                if (currentStep < CHALLENGES.length - 1) {
                    setCurrentStep(prev => prev + 1);
                    setSelectedLetters([]);
                    setAvailableLetters([...CHALLENGES[currentStep + 1].scrambled]); // Pre-load next
                    setFeedback(null);
                } else {
                    finishGame();
                }
            }, 1000);
        } else {
            setFeedback("wrong");
            loseHeart();
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const finishGame = async () => {
        setIsComplete(true);
        await addXp(50); // Reward
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-violet-600 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h1 className="text-4xl font-bold mb-4">You did it!</h1>
                <p className="text-xl opacity-90 mb-8">+50 XP Earned</p>
                <Button onClick={() => router.push("/dashboard")} className="bg-white text-violet-600 hover:bg-violet-50 text-xl px-8 py-4 rounded-full shadow-xl">
                    Continue Journey
                </Button>
            </div>
        );
    }

    const challenge = CHALLENGES[currentStep];

    return (
        <ModuleShell
            title="Phonics Adventure"
            totalSteps={CHALLENGES.length}
            currentStep={currentStep}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center justify-between min-h-[400px] w-full max-w-lg mx-auto">
                {/* Image Area */}
                <div className="text-9xl mb-8 animate-bounce-slow filter drop-shadow-xl">
                    {challenge.image}
                </div>

                {/* Drop Zone (Selected Letters) */}
                <div className="flex gap-2 mb-12 min-h-[80px] p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl w-full justify-center items-center border-2 border-dashed border-slate-300">
                    {selectedLetters.map((l, i) => (
                        <motion.button
                            layoutId={`letter-${i}`}
                            key={`selected-${i}`}
                            onClick={() => handleRemoveLetter(l, i)}
                            className={`w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-md border-b-4 border-slate-200 dark:border-slate-600 flex items-center justify-center text-3xl font-bold text-slate-700 dark:text-white ${feedback === 'correct' ? 'border-green-500 text-green-600' : feedback === 'wrong' ? 'border-red-500 text-red-600' : ''}`}
                        >
                            {l}
                        </motion.button>
                    ))}
                    {selectedLetters.length === 0 && <span className="text-slate-400">Tap letters below to build the word</span>}
                </div>

                {/* Question Type */}
                <h2 className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-8">
                    Spell: <span className="font-bold text-violet-600">{challenge.word}</span>
                </h2>

                {/* Letter Bank */}
                <div className="flex gap-3 flex-wrap justify-center mb-8">
                    {availableLetters.map((l, i) => (
                        <motion.button
                            layout
                            key={`bank-${i}`}
                            onClick={() => handleSelectLetter(l, i)}
                            className="w-16 h-16 bg-violet-100 dark:bg-slate-700 rounded-2xl shadow-sm border-b-4 border-violet-200 dark:border-slate-600 flex items-center justify-center text-3xl font-bold text-violet-700 dark:text-violet-300 hover:scale-105 active:scale-95 transition-all"
                        >
                            {l}
                        </motion.button>
                    ))}
                </div>

                <Button
                    onClick={checkAnswer}
                    disabled={selectedLetters.length !== challenge.word.length}
                    className={`w-full py-4 text-xl rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-100 ${feedback === "correct" ? "bg-green-500 hover:bg-green-600" :
                            feedback === "wrong" ? "bg-red-500 hover:bg-red-600" :
                                "bg-violet-600 hover:bg-violet-700"
                        }`}
                >
                    {feedback === "correct" ? "NICE!" : feedback === "wrong" ? "Try Again" : "Check Answer"}
                </Button>
            </div>
        </ModuleShell>
    );
}
