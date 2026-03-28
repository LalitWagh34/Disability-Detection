// "use client";

// import { useState, useEffect } from "react";
// import { AssessmentShell } from "./AssessmentShell";
// import { CanvasDraw } from "./CanvasDraw";
// import { VoiceInput } from "./VoiceInput";
// import { useAuth } from "@/context/AuthContext";
// import { db } from "@/db/db";
// import { useRouter } from "next/navigation";
// import { aiDiagnosis } from "@/services/AiDiagnosis";
// import { visionAi } from "@/services/VisionService";

// const READING_PASSAGES: Record<string, string> = {
//     "child": "The sun is hot. The sky is blue. I like to play in the park with my friends.",
//     "adult": "The phenomenon of neuroplasticity allows the brain to reorganize itself by forming new neural connections throughout life. This capability is essential for learning new skills and recovering from injuries."
// };

// export function DysgraphiaTest({ onComplete }: { onComplete?: () => void }) {
//     const router = useRouter();
//     const { user } = useAuth();

//     // State
//     const [currentStep, setCurrentStep] = useState(0);
//     const [drawingData, setDrawingData] = useState<string | null>(null);
//     const [voiceTranscript, setVoiceTranscript] = useState("");
//     const [isFinished, setIsFinished] = useState(false);
//     const [startTime] = useState(Date.now());

//     // AI State
//     const [aiState, setAiState] = useState<{ isAnalyzing: boolean; result: any; imageData: ImageData | null }>({
//         isAnalyzing: false,
//         result: null,
//         imageData: null
//     });

//     const ageGroup = (user?.age || 10) >= 12 ? 'adult' : 'child';

//     const handleCanvasCapture = async (dataUrl: string, imageData: ImageData) => {
//         setDrawingData(dataUrl);
//         setAiState(prev => ({ ...prev, isAnalyzing: true, imageData }));

//         // Analyze immediately with CNN
//         try {
//             const result = await visionAi.analyzeDrawing(imageData);
//             setAiState({ isAnalyzing: false, result, imageData });
//         } catch (error) {
//             console.error(error);
//             setAiState(prev => ({ ...prev, isAnalyzing: false }));
//         }
//     };

//     const handleNext = () => {
//         if (currentStep < 1) {
//             setCurrentStep(prev => prev + 1);
//         } else {
//             finishAssessment();
//         }
//     };

//     const handleBack = () => {
//         if (currentStep > 0) {
//             setCurrentStep(prev => prev - 1);
//         }
//     };

//     const finishAssessment = async () => {
//         setIsFinished(true);

//         // Analysis logic
//         const hasDrawing = !!drawingData && drawingData.length > 50;
//         const hasVoice = !!voiceTranscript && voiceTranscript.length > 5;
//         const timeTaken = (Date.now() - startTime) / 1000;

//         // 1. Diagnosis System Prediction (ML based on metadata)
//         const prediction = aiDiagnosis.predictDysgraphia(timeTaken, drawingData ? drawingData.length : 0);

//         // 2. Vision AI Prediction (Deep Learning based on pixels)
//         let visionResult = { label: "N/A", confidence: 0 };
//         if (aiState.imageData) {
//             try {
//                 // If not already analyzed (e.g. if user clicked next too fast), try again
//                 if (!aiState.result) {
//                     visionResult = await visionAi.analyzeDrawing(aiState.imageData);
//                 } else {
//                     visionResult = aiState.result;
//                 }
//                 console.log("Vision AI (CNN) Result:", visionResult);
//             } catch (e) {
//                 console.error("Vision AI Error:", e);
//             }
//         }

//         // Save to Dexie
//         if (user) {
//             await db.assessments.add({
//                 userId: user.id,
//                 type: 'dysgraphia',
//                 risk: prediction.risk as any, // "Low" | "Moderate" | "High"
//                 score: 0, // Dysgraphia doesn't have a simple score
//                 total: 2,
//                 details: {
//                     ageGroup,
//                     fluency: hasVoice ? "Good" : "Needs Review",
//                     drawingQuality: hasDrawing ? "Standard" : "Incomplete",
//                     voiceTranscript,
//                     timeTaken,
//                     aiProbability: prediction.probability,
//                     visionLabel: visionResult.label,
//                     visionConfidence: visionResult.confidence
//                 },
//                 date: new Date().toISOString()
//             });
//         }

//         setTimeout(() => {
//             if (onComplete) {
//                 onComplete();
//             } else {
//                 router.push("/report");
//             }
//         }, 1500);
//     };

//     if (isFinished) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fade-in">
//                 <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete!</h2>
//                 <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//                 <p className="text-lg text-slate-600 dark:text-slate-300">
//                     Saving results and proceeding...
//                 </p>
//             </div>
//         );
//     }

//     // Step 0: Handwriting
//     if (currentStep === 0) {
//         return (
//             <AssessmentShell
//                 title="Dysgraphia Assessment - Writing"
//                 currentStep={0}
//                 totalSteps={2}
//                 onNext={handleNext}
//                 onBack={handleBack}
//                 isNextDisabled={!drawingData}
//             >
//                 <div className="flex flex-col gap-4 items-center w-full max-w-2xl mx-auto">
//                     <p className="text-lg text-slate-700 dark:text-slate-300 mb-2">
//                         Please copy the sentence below in the pad:
//                     </p>
//                     <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-serif text-2xl mb-4 italic text-center w-full">
//                         "The five boxing wizards jump quickly."
//                     </div>

//                     <div className="w-full">
//                         <CanvasDraw
//                             onCapture={handleCanvasCapture}
//                             label="Draw here (release mouse to capture):"
//                         />
//                         {drawingData && (
//                             <div className="mt-2 text-center fade-in">
//                                 <p className="text-xs text-green-600">✓ Drawing captured (Length: {drawingData.length})</p>
//                                 {aiState.isAnalyzing && <p className="text-xs text-violet-500 animate-pulse">👁️ Vision AI Analysis in progress...</p>}
//                                 {aiState.result && (
//                                     <p className="text-xs font-bold text-violet-700 mt-1">
//                                         AI Verdict: {aiState.result.label} ({(aiState.result.confidence * 100).toFixed(1)}%)
//                                     </p>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </AssessmentShell>
//         );
//     }

//     // Step 1: Reading / Voice
//     return (
//         <AssessmentShell
//             title="Dysgraphia Assessment - Reading"
//             currentStep={1}
//             totalSteps={2}
//             onNext={handleNext}
//             onBack={handleBack}
//             isNextDisabled={!voiceTranscript}
//         >
//             <div className="flex flex-col gap-6 items-center text-center">
//                 <p className="text-lg text-slate-700 dark:text-slate-300">
//                     Read the following text aloud:
//                 </p>

//                 <div className="bg-indigo-50 dark:bg-slate-800 p-8 rounded-2xl border border-indigo-100 dark:border-slate-700 max-w-lg">
//                     <p className="text-xl leading-relaxed font-medium text-slate-800 dark:text-slate-200">
//                         "{READING_PASSAGES[ageGroup]}"
//                     </p>
//                 </div>

//                 <div className="w-full max-w-md">
//                     <VoiceInput
//                         onTranscriptChange={setVoiceTranscript}
//                         placeholder="Click microphone and read the text above..."
//                     />
//                 </div>
//             </div>
//         </AssessmentShell>
//     );
// }



"use client";

import { useState } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { CanvasDraw, StrokeMetrics } from "./CanvasDraw";
import { VoiceInput } from "./VoiceInput";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/db";
import { useRouter } from "next/navigation";
import { predictDysgraphia, DysgraphiaSignals } from "@/services/AiDiagnosis";
import { visionAi } from "@/services/VisionService";

// Two sentences — one per step — more data points, less room to hide
const TASKS = [
    {
        label: "Step 1 of 2 — Copy sentence",
        sentence: "The five boxing wizards jump quickly.",
        instruction: "Copy this sentence in the writing pad below, as clearly and naturally as you can.",
    },
    {
        label: "Step 2 of 2 — Write from memory",
        sentence: "She sells seashells by the seashore.",
        instruction: "Read the sentence, then close your eyes and write it from memory.",
    },
];

const READING_PASSAGES: Record<string, string> = {
    child: "The sun is hot. The sky is blue. I like to play in the park with my friends.",
    adult: "The phenomenon of neuroplasticity allows the brain to reorganize itself by forming new neural connections throughout life.",
};

export function DysgraphiaTest({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();

    const [currentStep, setCurrentStep]   = useState(0);
    // Per-task drawing data
    const [drawingData, setDrawingData]   = useState<(string|null)[]>([null, null]);
    const [strokeMetrics, setStrokeMetrics] = useState<(StrokeMetrics|null)[]>([null, null]);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [isFinished, setIsFinished]     = useState(false);

    const [aiState, setAiState] = useState<{ isAnalyzing: boolean; result: any; imageData: ImageData | null }>({
        isAnalyzing: false, result: null, imageData: null,
    });

    const ageGroup = (user?.age || 10) >= 12 ? "adult" : "child";
    const expectedLength = READING_PASSAGES[ageGroup].length;

    const handleCanvasCapture = async (dataUrl: string, imageData: ImageData, metrics: StrokeMetrics) => {
        // Save drawing + metrics for current drawing step (0 or 1)
        const taskIdx = currentStep;
        setDrawingData(prev => { const n = [...prev]; n[taskIdx] = dataUrl; return n; });
        setStrokeMetrics(prev => { const n = [...prev]; n[taskIdx] = metrics; return n; });
        setAiState(prev => ({ ...prev, isAnalyzing: true, imageData }));

        try {
            const result = await visionAi.analyzeDrawing(imageData);
            setAiState({ isAnalyzing: false, result, imageData });
        } catch {
            setAiState(prev => ({ ...prev, isAnalyzing: false }));
        }
    };

    // Steps: 0 = writing task 1, 1 = writing task 2, 2 = reading/voice
    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(p => p + 1);
        else finishAssessment();
    };
    const handleBack = () => { if (currentStep > 0) setCurrentStep(p => p - 1); };

    const isNextDisabled = () => {
        if (currentStep === 0) return !drawingData[0];
        if (currentStep === 1) return !drawingData[1];
        return !voiceTranscript;
    };

    const finishAssessment = async () => {
        setIsFinished(true);

        // Combine metrics from both writing tasks
        const m0 = strokeMetrics[0];
        const m1 = strokeMetrics[1];
        const combinedMetrics: DysgraphiaSignals = {
            penLifts:            (m0?.penLifts ?? 0) + (m1?.penLifts ?? 0),
            totalPathLength:     (m0?.totalPathLength ?? 0) + (m1?.totalPathLength ?? 0),
            drawingTimeMs:       (m0?.drawingTimeMs ?? 0) + (m1?.drawingTimeMs ?? 0),
            strokeSpeedVariance: ((m0?.strokeSpeedVariance ?? 0) + (m1?.strokeSpeedVariance ?? 0)) / 2,
            drawingComplete:     !!(m0?.drawingComplete && m1?.drawingComplete),
            voiceTranscriptLength: voiceTranscript.length,
            expectedTranscriptLength: expectedLength,
            visionLabel:    aiState.result?.label,
            visionConfidence: aiState.result?.confidence,
        };

        const result = predictDysgraphia(combinedMetrics);
        console.log("Dysgraphia screening result:", result);

        if (user) {
            await db.assessments.add({
                userId: user.id,
                type: "dysgraphia",
                risk: result.risk as any,
                score: 0,
                total: totalSteps,
                details: {
                    ageGroup,
                    strokeMetrics: combinedMetrics,
                    voiceTranscript,
                    riskScore: result.score,
                    breakdown: result.breakdown,
                    flags: result.flags,
                    aiProbability: result.probability,
                    visionLabel: aiState.result?.label,
                    visionConfidence: aiState.result?.confidence,
                },
                date: new Date().toISOString(),
            });
        }

        setTimeout(() => { onComplete ? onComplete() : router.push("/report"); }, 1500);
    };

    if (isFinished) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete! ✓</h2>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-300">Saving results…</p>
        </div>
    );

    // ── Writing tasks (steps 0 & 1) ───────────────────────────────────────────
    if (currentStep < 2) {
        const task = TASKS[currentStep];
        const captured = !!drawingData[currentStep];
        const metrics = strokeMetrics[currentStep];

        return (
            <AssessmentShell
                title="Dysgraphia Screening"
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                onBack={handleBack}
                isNextDisabled={!captured}
            >
                <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
                    <div className="text-xs font-bold uppercase tracking-wider text-violet-500 bg-violet-100 border border-violet-200 px-3 py-1 rounded-full self-start">
                        {task.label}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">{task.instruction}</p>

                    {/* Sentence to copy */}
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl font-serif text-2xl italic text-center tracking-wide text-slate-800 dark:text-slate-100 select-none">
                        {currentStep === 1 ? "👁 Read, then cover this and write from memory below." : null}
                        <p className={currentStep === 1 ? "mt-2" : ""}>{task.sentence}</p>
                    </div>

                    <CanvasDraw
                        onCapture={handleCanvasCapture}
                        label="Write here:"
                    />

                    {captured && metrics && (
                        <div className="flex flex-wrap gap-3 text-xs">
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                ✓ Captured
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                Pen lifts: {metrics.penLifts}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                Time: {(metrics.drawingTimeMs/1000).toFixed(1)}s
                            </span>
                            {aiState.isAnalyzing && (
                                <span className="text-violet-500 animate-pulse">👁 Analyzing writing…</span>
                            )}
                            {aiState.result && (
                                <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
                                    AI: {aiState.result.label} ({(aiState.result.confidence*100).toFixed(0)}%)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </AssessmentShell>
        );
    }

    // ── Step 2: Reading / Voice ───────────────────────────────────────────────
    return (
        <AssessmentShell
            title="Dysgraphia Screening — Reading Fluency"
            currentStep={2}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!voiceTranscript}
        >
            <div className="flex flex-col gap-6 items-center text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-100 border border-teal-200 px-3 py-1 rounded-full">
                    Step 3 of 3 — Reading Fluency
                </div>
                <p className="text-slate-600 dark:text-slate-300">Read the following text aloud clearly and at a natural pace:</p>

                <div className="bg-indigo-50 dark:bg-slate-800 p-8 rounded-2xl border border-indigo-100 dark:border-slate-700 max-w-lg text-left">
                    <p className="text-xl leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                        "{READING_PASSAGES[ageGroup]}"
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <VoiceInput
                        onTranscriptChange={setVoiceTranscript}
                        placeholder="Click the microphone and read the text above…"
                    />
                </div>

                {voiceTranscript && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                        <p className="font-medium mb-1">Transcript captured:</p>
                        <p className="italic text-slate-600 dark:text-slate-300">"{voiceTranscript}"</p>
                        <p className="mt-1 text-xs">
                            Coverage: {Math.round((voiceTranscript.length / expectedLength) * 100)}% of passage
                        </p>
                    </div>
                )}
            </div>
        </AssessmentShell>
    );
}
