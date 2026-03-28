"use client";

import { useState, useEffect } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/db";
import { aiDiagnosis } from "@/services/AiDiagnosis";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
    id: string;
    type: "text" | "choice";
    question: string;
    options?: string[];
    correctAnswer: string;
    category: "spelling" | "phonetics" | "visual" | "memory";
}

// ─── Groq API Key ─────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

// ─── Robust JSON extractor (handles markdown fences, extra text, etc.) ────────
function extractJsonArray(raw: string): string {
    // 1. Strip markdown code fences
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        const inner = fenceMatch[1].trim();
        const arrMatch = inner.match(/\[[\s\S]*\]/);
        if (arrMatch) return arrMatch[0];
    }
    // 2. Find JSON array directly
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (arrMatch) return arrMatch[0];
    // 3. Fallback
    return "[]";
}

// ─── Groq question fetch ──────────────────────────────────────────────────────
async function fetchQuestionsFromGroq(): Promise<Question[]> {
    const seed = Math.random().toString(36).slice(2, 9);

    const prompt = `Unique session seed (ignore): ${seed}

You are generating a dyslexia assessment quiz for children and adults (ages 8–30).
Generate EXACTLY 10 questions — 2-3 from each of these 4 categories: spelling, phonetics, visual, memory.

CATEGORY RULES:
- "spelling": multiple-choice questions where only one option is correctly spelled. Always 4 options.
- "phonetics": multiple-choice about rhyming words, starting sounds, or ending sounds. Always 4 options.
- "visual": multiple-choice about letter/shape confusion (b/d/p/q), sequences, or pattern matching. Always 4 options.
- "memory": short read-then-answer questions. type="text". correctAnswer is a SINGLE word.

STRICT RULES:
1. Return ONLY a raw JSON array. No markdown, no code fences, no explanation before or after.
2. Every question must have: id (q1–q10), type ("choice" or "text"), category, question, correctAnswer.
3. "choice" questions MUST have an "options" array of exactly 4 strings.
4. "text" questions must NOT have an "options" field.
5. correctAnswer must EXACTLY match one of the options (for choice) or be a single word (for text).
6. Make questions VARIED and DIFFERENT every time — use fresh words and scenarios.

Example format:
[
  {"id":"q1","type":"choice","category":"spelling","question":"Which word is spelled correctly?","options":["Recieve","Receive","Receve","Riceive"],"correctAnswer":"Receive"},
  {"id":"q6","type":"text","category":"memory","question":"Read: 'The big red barn.' Type the color word.","correctAnswer":"red"}
]`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Always respond with raw JSON only — no markdown, no code fences, no extra text whatsoever.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.9,
            max_tokens: 2000,
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const raw  = data?.choices?.[0]?.message?.content || "[]";

    let parsed: Question[] = [];
    try {
        const safeJson = extractJsonArray(raw);
        parsed = JSON.parse(safeJson);

        if (!Array.isArray(parsed) || parsed.length === 0) {
            console.warn("⚠️ Groq returned empty/invalid JSON. Raw:", raw);
            return [];
        }
    } catch (err) {
        console.error("❌ JSON Parse Failed. Raw response:", raw);
        return [];
    }

    // Sanitize: ensure choice questions have options array
    return parsed.filter(q =>
        q.id && q.type && q.category && q.question && q.correctAnswer &&
        (q.type === "text" || (q.type === "choice" && Array.isArray(q.options) && q.options.length >= 2))
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DyslexiaTest({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();

    const [questions, setQuestions]           = useState<Question[]>([]);
    const [loading, setLoading]               = useState(true);
    const [loadError, setLoadError]           = useState("");
    const [currentStep, setCurrentStep]       = useState(0);
    const [answers, setAnswers]               = useState<Record<string, string>>({});
    const [isFinished, setIsFinished]         = useState(false);
    const [handwritingImage, setHandwritingImage] = useState<string | null>(null);
    const [startTime]                         = useState(Date.now());

    // ── Load questions from Groq ───────────────────────────────────────────────
    const loadQuestions = () => {
        setLoading(true);
        setLoadError("");
        fetchQuestionsFromGroq()
            .then(data => {
                if (!data.length) throw new Error("No questions returned from Groq.");
                setQuestions(data);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoadError("Couldn't load assessment questions. Please try again.");
                setLoading(false);
            });
    };

    useEffect(() => { loadQuestions(); }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAnswer = (answer: string) => {
        if (!questions[currentStep]) return;
        setAnswers(prev => ({ ...prev, [questions[currentStep].id]: answer }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setHandwritingImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishAssessment();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const finishAssessment = async () => {
        setIsFinished(true);

        let score = 0;
        questions.forEach(q => {
            const ans     = answers[q.id]?.toLowerCase().trim();
            const correct = q.correctAnswer.toLowerCase().trim();
            if (ans === correct) score++;
        });

        const timeTaken = (Date.now() - startTime) / 1000;
        const prediction = aiDiagnosis.predictDyslexia(score, questions.length, timeTaken);
        console.log("AI Prediction:", prediction);

        if (user) {
            await db.assessments.add({
                userId: user.id,
                type: "dyslexia",
                score,
                total: questions.length,
                risk: prediction.risk as any,
                details: {
                    answers,
                    handwritingUploaded: !!handwritingImage,
                    aiProbability: prediction.probability,
                    timeTaken,
                },
                date: new Date().toISOString(),
            });
        }

        setTimeout(() => {
            if (onComplete) {
                onComplete();
            } else {
                router.push("/report");
            }
        }, 1500);
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-6">
                <div className="text-6xl animate-bounce">🧠</div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Preparing your assessment…
                </h2>
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Powered by Groq ⚡</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-5">
                <div className="text-5xl">😕</div>
                <p className="text-xl font-bold text-red-600">{loadError}</p>
                <button
                    onClick={loadQuestions}
                    className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all"
                >
                    Try Again 🔄
                </button>
            </div>
        );
    }

    // ── Finished ──────────────────────────────────────────────────────────────
    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete!</h2>
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Saving results and proceeding to next assessment...
                </p>
            </div>
        );
    }

    // ── Handwriting upload step (last step) ───────────────────────────────────
    if (currentStep === questions.length) {
        return (
            <AssessmentShell
                title="Dyslexia Assessment - Handwriting"
                currentStep={currentStep}
                totalSteps={questions.length + 1}
                onNext={handleNext}
                onBack={handleBack}
                isNextDisabled={!handwritingImage}
            >
                <div className="space-y-6 text-center">
                    <h3 className="text-xl font-medium text-slate-800 dark:text-white">
                        Write <span className="font-bold text-violet-600">"The quick brown fox"</span> on paper and upload a photo.
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                        <label className="w-64 h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all">
                            {handwritingImage ? (
                                <img src={handwritingImage} alt="Uploaded handwriting" className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <>
                                    <span className="text-4xl mb-2">📷</span>
                                    <span className="text-sm text-slate-500">Click to upload photo</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <p className="text-sm text-slate-400">This helps us analyze letter formation and spacing.</p>
                    </div>
                </div>
            </AssessmentShell>
        );
    }

    // ── Question step ─────────────────────────────────────────────────────────
    const currentQuestion = questions[currentStep];
    const currentAnswer   = answers[currentQuestion.id] || "";

    return (
        <AssessmentShell
            title="Dyslexia Assessment"
            currentStep={currentStep}
            totalSteps={questions.length + 1}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!currentAnswer}
        >
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-100 px-2 py-1 rounded">
                        {currentQuestion.category}
                    </span>
                </div>

                <h3 className="text-xl font-medium text-slate-800 dark:text-white">
                    {currentQuestion.question}
                </h3>

                {currentQuestion.type === "choice" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQuestion.options?.map((option,idx) => (
                            <button
                                key={`${currentQuestion.id}-${idx}`}
                                onClick={() => handleAnswer(option)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                currentAnswer === option
                                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                    : "border-slate-600 text-slate-300 hover:border-violet-400 hover:bg-violet-500/10"
                            }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {currentQuestion.type === "text" && (
                    <input
                        type="text"
                        value={currentAnswer}
                        onChange={e => handleAnswer(e.target.value)}
                        className="w-full p-4 text-black rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Type your answer here..."
                    />
                )}
            </div>
        </AssessmentShell>
    );
}