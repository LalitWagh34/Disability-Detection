"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface VoiceInputProps {
    onTranscriptChange: (transcript: string) => void;
    placeholder?: string;
}

export function VoiceInput({ onTranscriptChange, placeholder = "Speak now..." }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsSupported(false);
        }
    }, []);

    const toggleListening = () => {
        if (!isSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        if (!isListening) {
            recognition.start();
            setIsListening(true);
        } else {
            recognition.stop();
            setIsListening(false);
        }

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(finalTranscript);
                onTranscriptChange(finalTranscript);
                setIsListening(false); // Stop after getting final result suitable for short sentences
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    if (!isSupported) {
        return (
            <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
                Speech recognition is not supported in this browser. Please try Chrome.
                <textarea
                    className="w-full mt-2 p-3 border rounded-lg"
                    placeholder="Type what you read instead since voice is not supported."
                    onChange={(e) => onTranscriptChange(e.target.value)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? "bg-red-100 animate-pulse scale-110" : "bg-slate-100"
                }`}>
                <span className="text-4xl">{isListening ? "🎙️" : "🎤"}</span>
            </div>

            <Button
                onClick={toggleListening}
                className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
            >
                {isListening ? "Stop Listening" : "Start Speaking"}
            </Button>

            {transcript && (
                <div className="w-full mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                    <p className="text-slate-600 dark:text-slate-300 italic">"{transcript}"</p>
                </div>
            )}
        </div>
    );
}
