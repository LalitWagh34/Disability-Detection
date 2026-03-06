"use client";

import { useCallback } from 'react';

// Simple sound synthesis using Web Audio API to avoid external assets for this prototype
// In a real app, we would load MP3 files.
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, delay = 0) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
};

export function useGameSounds() {

    const playCorrect = useCallback(() => {
        // Happy "Ding" (High C major arpeggio)
        playTone(523.25, 'sine', 0.1, 0); // C5
        playTone(659.25, 'sine', 0.1, 0.1); // E5
        playTone(783.99, 'sine', 0.3, 0.2); // G5
    }, []);

    const playWrong = useCallback(() => {
        // Sad "Buzz" (Low dissonant)
        playTone(150, 'sawtooth', 0.2, 0);
        playTone(140, 'sawtooth', 0.4, 0.1);
    }, []);

    const playSuccess = useCallback(() => {
        // Victory Fanfare
        const now = 0;
        playTone(523.25, 'square', 0.1, now);
        playTone(523.25, 'square', 0.1, now + 0.1);
        playTone(523.25, 'square', 0.1, now + 0.2);
        playTone(659.25, 'square', 0.4, now + 0.3);
        playTone(523.25, 'square', 0.2, now + 0.7);
        playTone(659.25, 'square', 0.6, now + 0.9);
    }, []);

    const playClick = useCallback(() => {
        playTone(800, 'triangle', 0.05, 0);
    }, []);

    return { playCorrect, playWrong, playSuccess, playClick };
}
