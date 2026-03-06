"use client";
import { useState, useRef, useCallback } from "react";
import { attentionAi } from "@/services/AttentionService";

export interface Interaction {
    time: number;    // seconds taken
    correct: boolean;
}

export function useAttention() {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [fatigueLevel, setFatigueLevel] = useState<number>(0); // 0–1
    const questionStartRef = useRef<number>(Date.now());

    // Call this when a new question is displayed
    const startTimer = useCallback(() => {
        questionStartRef.current = Date.now();
    }, []);

    // Call this when the user answers
    const recordAnswer = useCallback(async (correct: boolean) => {
        const timeTaken = (Date.now() - questionStartRef.current) / 1000;
        const newInteraction: Interaction = { time: timeTaken, correct };

        setInteractions(prev => {
            const updated = [...prev, newInteraction];

            // Predict fatigue whenever we have 5+ data points
            if (updated.length >= 5) {
                attentionAi.predictFatigue(updated).then(level => {
                    setFatigueLevel(level);
                    if (level > 0.7) {
                        console.warn("⚠️ High fatigue detected:", level.toFixed(2));
                    }
                });
            }

            return updated;
        });
    }, []);

    const isFatigued = fatigueLevel > 0.65;

    return { interactions, fatigueLevel, isFatigued, startTimer, recordAnswer };
}
