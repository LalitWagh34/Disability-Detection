"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import Link from "next/link";

import { TextToSpeech } from "../ui/TextToSpeech";

interface ModuleShellProps {
    title: string;
    totalSteps: number;
    currentStep: number;
    onExit: () => void;
    children: React.ReactNode;
    instructionText?: string; // Optional text to read instead of title
}

export function ModuleShell({ title, totalSteps, currentStep, onExit, children, instructionText }: ModuleShellProps) {
    const { user } = useAuth();
    const router = useRouter();

    // calculate progress percentage
    const progress = Math.min(100, Math.max(0, ((currentStep) / totalSteps) * 100));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onExit}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                    >
                        ✕
                    </button>
                    {/* Progress Bar */}
                    <div className="flex-1 min-w-[100px] md:min-w-[200px] h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <TextToSpeech text={instructionText || title} />
                    <div className="flex items-center gap-1 text-red-500 font-bold">
                        <span>❤️</span>
                        <span>{user?.hearts ?? 5}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-4 md:p-8 max-w-4xl flex flex-col items-center justify-center animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center flex items-center gap-2">
                    {title}
                </h1>
                <div className="w-full bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 min-h-[400px] flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
