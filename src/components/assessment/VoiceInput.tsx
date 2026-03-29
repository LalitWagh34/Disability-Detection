// "use client";

// import { useState, useEffect, useRef } from "react";

// interface VoiceInputProps {
//     onTranscriptChange: (transcript: string) => void;
//     placeholder?: string;
// }

// export function VoiceInput({ onTranscriptChange, placeholder = "Speak now..." }: VoiceInputProps) {
//     const [isListening, setIsListening]       = useState(false);
//     const [interimText, setInterimText]       = useState(""); // live "in progress" text
//     const [transcript, setTranscript]         = useState("");
//     const [isSupported, setIsSupported]       = useState(true);
//     const [error, setError]                   = useState("");
//     const recognitionRef                      = useRef<any>(null);
//     const manualStopRef                       = useRef(false); // tracks if WE stopped it

//     useEffect(() => {
//         if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
//             setIsSupported(false);
//         }
//     }, []);

//     useEffect(() => {
//         return () => { recognitionRef.current?.abort(); };
//     }, []);

//     const startListening = () => {
//         setError("");
//         setInterimText("");
//         manualStopRef.current = false;

//         const SpeechRecognition =
//             (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

//         const recognition = new SpeechRecognition();
//         recognitionRef.current = recognition;

//         // continuous=true gives more time, interimResults shows live feedback
//         recognition.continuous     = true;
//         recognition.interimResults = true;
//         recognition.lang           = "en-US";
//         recognition.maxAlternatives = 1;

//         recognition.onstart = () => {
//             setIsListening(true);
//         };

//         recognition.onresult = (event: any) => {
//             let interim = "";
//             let final   = "";

//             for (let i = event.resultIndex; i < event.results.length; i++) {
//                 const text = event.results[i][0].transcript;
//                 if (event.results[i].isFinal) {
//                     final += text;
//                 } else {
//                     interim += text;
//                 }
//             }

//             // Show live interim text so user knows it's hearing them
//             if (interim) setInterimText(interim);

//             // Commit final result
//             if (final) {
//                 setTranscript(final);
//                 setInterimText("");
//                 onTranscriptChange(final);
//                 // Stop after getting a committed result
//                 manualStopRef.current = true;
//                 recognition.stop();
//             }
//         };

//         recognition.onerror = (event: any) => {
//             if (event.error === "aborted") return;
//             if (manualStopRef.current) return; // we stopped it, ignore

//             const msgs: Record<string, string> = {
//                 "no-speech":          "No speech detected — speak a little louder or closer to the mic.",
//                 "audio-capture":      "Microphone not found. Check your device settings.",
//                 "not-allowed":        "Microphone access denied. Click the 🔒 icon in your browser and allow mic.",
//                 "network":            "Network error. Check your connection.",
//                 "service-not-allowed":"Speech service blocked. Please use Chrome.",
//             };
//             setError(msgs[event.error] ?? `Speech error: ${event.error}`);
//             setIsListening(false);
//             setInterimText("");
//         };

//         recognition.onend = () => {
//             setIsListening(false);
//             setInterimText("");
//         };

//         recognition.start();
//     };

//     const stopListening = () => {
//         manualStopRef.current = true;
//         recognitionRef.current?.stop();
//         setIsListening(false);
//         setInterimText("");
//     };

//     const toggleListening = () => {
//         if (!isSupported) return;
//         isListening ? stopListening() : startListening();
//     };

//     const reset = () => {
//         stopListening();
//         setTranscript("");
//         setError("");
//         setInterimText("");
//         onTranscriptChange("");
//     };

//     if (!isSupported) {
//         return (
//             <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
//                 Speech recognition is not supported. Please use Chrome.
//                 <textarea
//                     className="w-full mt-2 p-3 border rounded-lg text-black"
//                     placeholder="Type your answer instead."
//                     onChange={e => onTranscriptChange(e.target.value)}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col gap-5 items-center w-full">

//             <style>{`
//                 @keyframes voiceBar {
//                     from { transform: scaleY(0.25); opacity: 0.45; }
//                     to   { transform: scaleY(1);    opacity: 1;    }
//                 }
//             `}</style>

//             {/* ── Mic button with ripple ── */}
//             <div className="relative flex items-center justify-center w-24 h-24">
//                 {isListening && (
//                     <>
//                         <span className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
//                         <span className="absolute rounded-full bg-red-400 opacity-15 animate-ping"
//                             style={{ inset: "-14px", animationDelay: "0.3s" }} />
//                     </>
//                 )}
//                 <button
//                     onClick={toggleListening}
//                     aria-label={isListening ? "Stop listening" : "Start speaking"}
//                     className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 ${
//                         isListening
//                             ? "bg-red-500 scale-110 shadow-red-500/50"
//                             : "bg-violet-600 hover:bg-violet-700 hover:scale-105 shadow-violet-500/30"
//                     }`}
//                 >
//                     <span className="text-4xl select-none">
//                         {isListening ? "🎙️" : "🎤"}
//                     </span>
//                 </button>
//             </div>

//             {/* ── Status label ── */}
//             <div className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
//                 isListening ? "text-red-400" : "text-slate-400"
//             }`}>
//                 <span className={`w-2.5 h-2.5 rounded-full inline-block transition-colors ${
//                     isListening ? "bg-red-500 animate-pulse" : "bg-slate-500"
//                 }`} />
//                 {isListening ? "Listening… speak now" : "Tap the mic to speak"}
//             </div>

//             {/* ── Waveform bars ── */}
//             <div className="flex items-end gap-1 h-10" aria-hidden="true">
//                 {[0.4, 0.75, 1, 0.55, 0.9, 0.45, 0.8, 0.3, 0.7, 1, 0.5].map((h, i) => (
//                     <span
//                         key={i}
//                         className={`w-1.5 rounded-full transition-colors duration-300 ${
//                             isListening ? "bg-red-400" : "bg-slate-600"
//                         }`}
//                         style={{
//                             height: `${h * 100}%`,
//                             animationName: isListening ? "voiceBar" : "none",
//                             animationDuration: "0.85s",
//                             animationTimingFunction: "ease-in-out",
//                             animationIterationCount: "infinite",
//                             animationDirection: "alternate",
//                             animationDelay: `${i * 0.07}s`,
//                             transform: isListening ? undefined : "scaleY(0.25)",
//                             opacity: isListening ? 1 : 0.35,
//                         }}
//                     />
//                 ))}
//             </div>

//             {/* ── Live interim text — KEY: shows user it IS hearing them ── */}
//             {interimText && (
//                 <div className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600 border-dashed">
//                     <p className="text-slate-400 text-sm italic animate-pulse">
//                         🎧 "{interimText}"
//                     </p>
//                 </div>
//             )}

//             {/* ── Error ── */}
//             {error && (
//                 <p className="text-sm text-red-400 text-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 w-full">
//                     ⚠️ {error}
//                 </p>
//             )}

//             {/* ── Final transcript ── */}
//             {transcript && !isListening && (
//                 <div className="w-full p-4 bg-slate-800 rounded-xl border border-violet-500/30">
//                     <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">You said</p>
//                     <p className="text-slate-200 italic">"{transcript}"</p>
//                     <button
//                         onClick={reset}
//                         className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline"
//                     >
//                         Try again
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }

"use client";

import { useState, useEffect, useRef } from "react";

interface VoiceInputProps {
    onTranscriptChange: (transcript: string) => void;
    placeholder?: string;
}

export function VoiceInput({ onTranscriptChange, placeholder = "Speak now..." }: VoiceInputProps) {
    const [isListening, setIsListening]   = useState(false);
    const [interimText, setInterimText]   = useState("");
    const [transcript, setTranscript]     = useState("");
    const [isSupported, setIsSupported]   = useState(true);
    const [error, setError]               = useState("");
    const recognitionRef                  = useRef<any>(null);
    const manualStopRef                   = useRef(false);
    const transcriptRef                   = useRef(""); // ✅ always holds latest transcript value

    // Keep ref in sync with state
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsSupported(false);
        }
    }, []);

    useEffect(() => {
        return () => { recognitionRef.current?.abort(); };
    }, []);

    const startListening = () => {
        setError("");
        setInterimText("");
        manualStopRef.current = false;

        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous      = true;
        recognition.interimResults  = true;
        recognition.lang            = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            let interim = "";
            let newFinal = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    newFinal += text;
                } else {
                    interim += text;
                }
            }

            if (interim) setInterimText(interim);

            if (newFinal) {
                // ✅ FIX: compute accumulated value using ref (always fresh),
                //    then call both setters outside any setState callback
                const accumulated = transcriptRef.current.trim()
                    ? transcriptRef.current.trim() + " " + newFinal.trim()
                    : newFinal.trim();

                setTranscript(accumulated);       // ✅ simple assignment, no updater callback
                onTranscriptChange(accumulated);  // ✅ called outside setState — no more React error
                setInterimText("");
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === "aborted") return;
            if (manualStopRef.current) return;

            const msgs: Record<string, string> = {
                "no-speech":           "No speech detected — speak a little louder or closer to the mic.",
                "audio-capture":       "Microphone not found. Check your device settings.",
                "not-allowed":         "Microphone access denied. Click the 🔒 icon in your browser and allow mic.",
                "network":             "Network error. Check your connection.",
                "service-not-allowed": "Speech service blocked. Please use Chrome.",
            };
            setError(msgs[event.error] ?? `Speech error: ${event.error}`);
            setIsListening(false);
            setInterimText("");
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText("");
        };

        recognition.start();
    };

    const stopListening = () => {
        manualStopRef.current = true;
        recognitionRef.current?.stop();
        setIsListening(false);
        setInterimText("");
    };

    const toggleListening = () => {
        if (!isSupported) return;
        isListening ? stopListening() : startListening();
    };

    const reset = () => {
        stopListening();
        setTranscript("");
        transcriptRef.current = "";
        setError("");
        setInterimText("");
        onTranscriptChange("");
    };

    if (!isSupported) {
        return (
            <div className="text-red-500 text-sm p-4 bg-red-50 rounded-lg">
                Speech recognition is not supported. Please use Chrome.
                <textarea
                    className="w-full mt-2 p-3 border rounded-lg text-black"
                    placeholder="Type your answer instead."
                    onChange={e => onTranscriptChange(e.target.value)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 items-center w-full">

            <style>{`
                @keyframes voiceBar {
                    from { transform: scaleY(0.25); opacity: 0.45; }
                    to   { transform: scaleY(1);    opacity: 1;    }
                }
            `}</style>

            {/* ── Mic button with ripple ── */}
            <div className="relative flex items-center justify-center w-24 h-24">
                {isListening && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-red-500 opacity-25 animate-ping" />
                        <span className="absolute rounded-full bg-red-400 opacity-15 animate-ping"
                            style={{ inset: "-14px", animationDelay: "0.3s" }} />
                    </>
                )}
                <button
                    onClick={toggleListening}
                    aria-label={isListening ? "Stop listening" : "Start speaking"}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400 ${
                        isListening
                            ? "bg-red-500 scale-110 shadow-red-500/50"
                            : "bg-violet-600 hover:bg-violet-700 hover:scale-105 shadow-violet-500/30"
                    }`}
                >
                    <span className="text-4xl select-none">
                        {isListening ? "🎙️" : "🎤"}
                    </span>
                </button>
            </div>

            {/* ── Status label ── */}
            <div className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                isListening ? "text-red-400" : "text-slate-400"
            }`}>
                <span className={`w-2.5 h-2.5 rounded-full inline-block transition-colors ${
                    isListening ? "bg-red-500 animate-pulse" : "bg-slate-500"
                }`} />
                {isListening ? "Listening… speak now" : "Tap the mic to speak"}
            </div>

            {/* ── Waveform bars ── */}
            <div className="flex items-end gap-1 h-10" aria-hidden="true">
                {[0.4, 0.75, 1, 0.55, 0.9, 0.45, 0.8, 0.3, 0.7, 1, 0.5].map((h, i) => (
                    <span
                        key={i}
                        className={`w-1.5 rounded-full transition-colors duration-300 ${
                            isListening ? "bg-red-400" : "bg-slate-600"
                        }`}
                        style={{
                            height: `${h * 100}%`,
                            animationName: isListening ? "voiceBar" : "none",
                            animationDuration: "0.85s",
                            animationTimingFunction: "ease-in-out",
                            animationIterationCount: "infinite",
                            animationDirection: "alternate",
                            animationDelay: `${i * 0.07}s`,
                            transform: isListening ? undefined : "scaleY(0.25)",
                            opacity: isListening ? 1 : 0.35,
                        }}
                    />
                ))}
            </div>

            {/* ── Live interim text ── */}
            {interimText && (
                <div className="w-full px-4 py-3 bg-slate-700/50 rounded-xl border border-slate-600 border-dashed">
                    <p className="text-slate-400 text-sm italic animate-pulse">
                        🎧 "{interimText}"
                    </p>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 w-full">
                    ⚠️ {error}
                </p>
            )}

            {/* ── Final transcript ── */}
            {transcript && !isListening && (
                <div className="w-full p-4 bg-slate-800 rounded-xl border border-violet-500/30">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">You said</p>
                    <p className="text-slate-200 italic">"{transcript}"</p>
                    <button
                        onClick={reset}
                        className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    );
}