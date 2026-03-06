"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";

interface TextToSpeechProps {
    text: string;
    className?: string;
}

export function TextToSpeech({ text, className }: TextToSpeechProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setSupported(true);
        }
    }, []);

    const speak = () => {
        if (!supported) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Slightly slower for clarity

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    if (!supported) return null;

    return (
        <Button
            variant="ghost"
            onClick={speak}
            className={`rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${isSpeaking ? 'text-violet-600 bg-violet-50 animate-pulse' : 'text-slate-500'} ${className}`}
            title="Read Aloud"
        >
            {isSpeaking ? '🔊' : '🔈'}
        </Button>
    );
}
