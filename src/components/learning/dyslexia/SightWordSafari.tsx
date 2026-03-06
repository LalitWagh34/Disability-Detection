"use client";

import { useState } from "react";
import { ModuleShell } from "../ModuleShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface GridCell {
    id: string;
    letter: string;
    wordId?: string; // If it belongs to a hidden word
}

const WORDS = ["THE", "AND", "YOU", "IS"];
const GRID_SIZE = 6;

// Helper to generate a simple grid (mock logic for prototype)
const generateGrid = () => {
    // Ideally this would be a real word search generator
    // For now, we'll hardcode a simple grid for demonstration
    const grid: string[][] = [
        ['T', 'H', 'E', 'X', 'Y', 'Z'],
        ['A', 'N', 'D', 'B', 'N', 'M'],
        ['O', 'P', 'Q', 'Y', 'O', 'U'],
        ['I', 'S', 'A', 'B', 'C', 'D'],
        ['E', 'F', 'G', 'H', 'I', 'J'],
        ['K', 'L', 'M', 'N', 'O', 'P']
    ];
    return grid;
};

import { useGameSounds } from "@/hooks/useGameSounds";

export function SightWordSafari() {
    const { addXp, user } = useAuth();
    const router = useRouter();
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selectedCells, setSelectedCells] = useState<{ r: number, c: number }[]>([]);
    const [grid] = useState(generateGrid());
    const [isComplete, setIsComplete] = useState(false);
    const { playCorrect, playWrong, playSuccess } = useGameSounds();

    const handleCellClick = (r: number, c: number) => {
        // Toggle selection
        const existingIndex = selectedCells.findIndex(cell => cell.r === r && cell.c === c);
        let newSelection = [...selectedCells];

        if (existingIndex >= 0) {
            newSelection.splice(existingIndex, 1);
        } else {
            newSelection.push({ r, c });
        }

        // Check for words (simplified checking: just check if letters match a word regardless of order/adjacency for this proto)
        // A real implementation would check adjacency and direction.
        // CHECK: Form string from selection sorted by position? 
        // Let's just do a simple "Check" button for version 1 to avoid complex drag logic.
        setSelectedCells(newSelection);
    };

    const checkSelection = () => {
        // Sort selection by row then col
        const sorted = [...selectedCells].sort((a, b) => (a.r - b.r) || (a.c - b.c));
        const word = sorted.map(cell => grid[cell.r][cell.c]).join("");

        if (WORDS.includes(word) && !foundWords.includes(word)) {
            playCorrect();
            setFoundWords([...foundWords, word]);
            setSelectedCells([]); // clear selection
            if (foundWords.length + 1 === WORDS.length) {
                playSuccess();
                finishGame();
            }
        } else {
            playWrong();
            // Shake visual or feedback?
            alert("Try again! Make sure letters are in order.");
            setSelectedCells([]);
        }
    };

    const finishGame = async () => {
        setIsComplete(true);
        await addXp(50);
    };

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-orange-500 text-white p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🦁</div>
                <h1 className="text-4xl font-bold mb-4">Safari Complete!</h1>
                <p className="text-xl opacity-90 mb-8">+50 XP Earned</p>
                <Button onClick={() => router.push("/dashboard")} className="bg-white text-orange-600 hover:bg-orange-50 text-xl px-8 py-4 rounded-full shadow-xl">
                    Back to Map
                </Button>
            </div>
        );
    }

    return (
        <ModuleShell
            title="Sight Word Safari"
            totalSteps={WORDS.length}
            currentStep={foundWords.length}
            onExit={() => router.push("/dashboard")}
        >
            <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
                <p className="text-slate-600 dark:text-slate-300 mb-4">Find: {WORDS.filter(w => !foundWords.includes(w)).join(", ")}</p>

                <div className="grid grid-cols-6 gap-2 bg-slate-200 dark:bg-slate-700 p-4 rounded-xl">
                    {grid.map((row, r) => (
                        row.map((letter, c) => {
                            const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`
                                        w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-xl flex items-center justify-center transition-all
                                        ${isSelected
                                            ? 'bg-orange-500 text-white scale-110 shadow-lg'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-100 dark:hover:bg-slate-600'}
                                    `}
                                >
                                    {letter}
                                </button>
                            );
                        })
                    ))}
                </div>

                <Button onClick={checkSelection} disabled={selectedCells.length === 0} className="w-full mt-4">
                    Check Word
                </Button>
            </div>
        </ModuleShell>
    );
}
