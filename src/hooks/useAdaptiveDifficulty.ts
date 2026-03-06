"use client";
import { useState, useCallback, useRef } from "react";
import { gameAi } from "@/services/GameAiService";

export function useAdaptiveDifficulty(initialLevel = 1) {
    const [level, setLevel] = useState(initialLevel);
    const [streak, setStreak] = useState(0);
    const [successRate, setSuccessRate] = useState(1.0);
    const totalAnswers = useRef(0);
    const correctAnswers = useRef(0);

    const recordResult = useCallback(async (correct: boolean, timeTaken: number) => {
        totalAnswers.current++;
        if (correct) correctAnswers.current++;

        const rate = correctAnswers.current / totalAnswers.current;
        const newStreak = correct ? streak + 1 : 0;
        setStreak(newStreak);
        setSuccessRate(rate);

        // Reward function: +1 correct+fast, +0.1 correct+slow, -1 wrong
        const reward = correct ? (timeTaken < 5 ? 1.0 : 0.1) : -1.0;

        const state = [level / 20, newStreak / 10, rate];
        const action = await gameAi.getAction(level, newStreak, rate);

        const nextLevel = action === 2
            ? Math.min(20, level + 1)   // Harder
            : action === 0
                ? Math.max(1, level - 1)    // Easier
                : level;                    // Same

        // Train: reward the action taken
        const nextState = [nextLevel / 20, (correct ? newStreak : 0) / 10, rate];
        await gameAi.train(state, action, reward, nextState);

        setLevel(nextLevel);
        return nextLevel;
    }, [level, streak]);

    return { level, streak, successRate, recordResult };
}
