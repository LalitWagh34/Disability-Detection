// "use client";

// import { useState, useEffect } from "react";
// import { AssessmentShell } from "./AssessmentShell";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { db } from "@/db/db";
// import { aiDiagnosis } from "@/services/AiDiagnosis";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Question {
//     id: string;
//     type: "text" | "choice";
//     question: string;
//     options?: string[];
//     correctAnswer: string;
//     category: "spelling" | "phonetics" | "visual" | "memory";
// }

// // ─── Groq API Key ─────────────────────────────────────────────────────────────
// const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

// // ─── Robust JSON extractor (handles markdown fences, extra text, etc.) ────────
// function extractJsonArray(raw: string): string {
//     // 1. Strip markdown code fences
//     const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
//     if (fenceMatch) {
//         const inner = fenceMatch[1].trim();
//         const arrMatch = inner.match(/\[[\s\S]*\]/);
//         if (arrMatch) return arrMatch[0];
//     }
//     // 2. Find JSON array directly
//     const arrMatch = raw.match(/\[[\s\S]*\]/);
//     if (arrMatch) return arrMatch[0];
//     // 3. Fallback
//     return "[]";
// }

// // ─── Groq question fetch ──────────────────────────────────────────────────────
// async function fetchQuestionsFromGroq(): Promise<Question[]> {
//     const seed = Math.random().toString(36).slice(2, 9);

//     const prompt = `Unique session seed (ignore): ${seed}

// You are generating a dyslexia assessment quiz for children and adults (ages 8–30).
// Generate EXACTLY 10 questions — 2-3 from each of these 4 categories: spelling, phonetics, visual, memory.

// CATEGORY RULES:
// - "spelling": multiple-choice questions where only one option is correctly spelled. Always 4 options.
// - "phonetics": multiple-choice about rhyming words, starting sounds, or ending sounds. Always 4 options.
// - "visual": multiple-choice about letter/shape confusion (b/d/p/q), sequences, or pattern matching. Always 4 options.
// - "memory": short read-then-answer questions. type="text". correctAnswer is a SINGLE word.

// STRICT RULES:
// 1. Return ONLY a raw JSON array. No markdown, no code fences, no explanation before or after.
// 2. Every question must have: id (q1–q10), type ("choice" or "text"), category, question, correctAnswer.
// 3. "choice" questions MUST have an "options" array of exactly 4 strings.
// 4. "text" questions must NOT have an "options" field.
// 5. correctAnswer must EXACTLY match one of the options (for choice) or be a single word (for text).
// 6. Make questions VARIED and DIFFERENT every time — use fresh words and scenarios.

// Example format:
// [
//   {"id":"q1","type":"choice","category":"spelling","question":"Which word is spelled correctly?","options":["Recieve","Receive","Receve","Riceive"],"correctAnswer":"Receive"},
//   {"id":"q6","type":"text","category":"memory","question":"Read: 'The big red barn.' Type the color word.","correctAnswer":"red"}
// ]`;

//     const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${GROQ_API_KEY}`,
//         },
//         body: JSON.stringify({
//             model: "llama-3.3-70b-versatile",
//             messages: [
//                 {
//                     role: "system",
//                     content: "You are a helpful assistant. Always respond with raw JSON only — no markdown, no code fences, no extra text whatsoever.",
//                 },
//                 { role: "user", content: prompt },
//             ],
//             temperature: 0.9,
//             max_tokens: 2000,
//         }),
//     });

//     if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(`Groq error ${res.status}: ${errText}`);
//     }

//     const data = await res.json();
//     const raw  = data?.choices?.[0]?.message?.content || "[]";

//     let parsed: Question[] = [];
//     try {
//         const safeJson = extractJsonArray(raw);
//         parsed = JSON.parse(safeJson);

//         if (!Array.isArray(parsed) || parsed.length === 0) {
//             console.warn("⚠️ Groq returned empty/invalid JSON. Raw:", raw);
//             return [];
//         }
//     } catch (err) {
//         console.error("❌ JSON Parse Failed. Raw response:", raw);
//         return [];
//     }

//     // Sanitize: ensure choice questions have options array
//     return parsed.filter(q =>
//         q.id && q.type && q.category && q.question && q.correctAnswer &&
//         (q.type === "text" || (q.type === "choice" && Array.isArray(q.options) && q.options.length >= 2))
//     );
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export function DyslexiaTest({ onComplete }: { onComplete?: () => void }) {
//     const router = useRouter();
//     const { user } = useAuth();

//     const [questions, setQuestions]           = useState<Question[]>([]);
//     const [loading, setLoading]               = useState(true);
//     const [loadError, setLoadError]           = useState("");
//     const [currentStep, setCurrentStep]       = useState(0);
//     const [answers, setAnswers]               = useState<Record<string, string>>({});
//     const [isFinished, setIsFinished]         = useState(false);
//     const [handwritingImage, setHandwritingImage] = useState<string | null>(null);
//     const [startTime]                         = useState(Date.now());

//     // ── Load questions from Groq ───────────────────────────────────────────────
//     const loadQuestions = () => {
//         setLoading(true);
//         setLoadError("");
//         fetchQuestionsFromGroq()
//             .then(data => {
//                 if (!data.length) throw new Error("No questions returned from Groq.");
//                 setQuestions(data);
//                 setLoading(false);
//             })
//             .catch(e => {
//                 console.error(e);
//                 setLoadError("Couldn't load assessment questions. Please try again.");
//                 setLoading(false);
//             });
//     };

//     useEffect(() => { loadQuestions(); }, []);

//     // ── Handlers ──────────────────────────────────────────────────────────────
//     const handleAnswer = (answer: string) => {
//         if (!questions[currentStep]) return;
//         setAnswers(prev => ({ ...prev, [questions[currentStep].id]: answer }));
//     };

//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => setHandwritingImage(reader.result as string);
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleNext = () => {
//         if (currentStep < questions.length) {
//             setCurrentStep(prev => prev + 1);
//         } else {
//             finishAssessment();
//         }
//     };

//     const handleBack = () => {
//         if (currentStep > 0) setCurrentStep(prev => prev - 1);
//     };

//     const finishAssessment = async () => {
//         setIsFinished(true);

//         let score = 0;
//         questions.forEach(q => {
//             const ans     = answers[q.id]?.toLowerCase().trim();
//             const correct = q.correctAnswer.toLowerCase().trim();
//             if (ans === correct) score++;
//         });

//         const timeTaken = (Date.now() - startTime) / 1000;
//         const prediction = aiDiagnosis.predictDyslexia(score, questions.length, timeTaken);
//         console.log("AI Prediction:", prediction);

//         if (user) {
//             await db.assessments.add({
//                 userId: user.id,
//                 type: "dyslexia",
//                 score,
//                 total: questions.length,
//                 risk: prediction.risk as any,
//                 details: {
//                     answers,
//                     handwritingUploaded: !!handwritingImage,
//                     aiProbability: prediction.probability,
//                     timeTaken,
//                 },
//                 date: new Date().toISOString(),
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

//     // ── Loading ───────────────────────────────────────────────────────────────
//     if (loading) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-6">
//                 <div className="text-6xl animate-bounce">🧠</div>
//                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
//                     Preparing your assessment…
//                 </h2>
//                 <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
//                 <p className="text-sm text-slate-400">Powered by Groq ⚡</p>
//             </div>
//         );
//     }

//     // ── Error ─────────────────────────────────────────────────────────────────
//     if (loadError) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-5">
//                 <div className="text-5xl">😕</div>
//                 <p className="text-xl font-bold text-red-600">{loadError}</p>
//                 <button
//                     onClick={loadQuestions}
//                     className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all"
//                 >
//                     Try Again 🔄
//                 </button>
//             </div>
//         );
//     }

//     // ── Finished ──────────────────────────────────────────────────────────────
//     if (isFinished) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
//                 <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete!</h2>
//                 <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
//                 <p className="text-lg text-slate-600 dark:text-slate-300">
//                     Saving results and proceeding to next assessment...
//                 </p>
//             </div>
//         );
//     }

//     // ── Handwriting upload step (last step) ───────────────────────────────────
//     if (currentStep === questions.length) {
//         return (
//             <AssessmentShell
//                 title="Dyslexia Assessment - Handwriting"
//                 currentStep={currentStep}
//                 totalSteps={questions.length + 1}
//                 onNext={handleNext}
//                 onBack={handleBack}
//                 isNextDisabled={!handwritingImage}
//             >
//                 <div className="space-y-6 text-center">
//                     <h3 className="text-xl font-medium text-slate-800 dark:text-white">
//                         Write <span className="font-bold text-violet-600">"The quick brown fox"</span> on paper and upload a photo.
//                     </h3>
//                     <div className="flex flex-col items-center gap-4">
//                         <label className="w-64 h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all">
//                             {handwritingImage ? (
//                                 <img src={handwritingImage} alt="Uploaded handwriting" className="w-full h-full object-contain rounded-xl" />
//                             ) : (
//                                 <>
//                                     <span className="text-4xl mb-2">📷</span>
//                                     <span className="text-sm text-slate-500">Click to upload photo</span>
//                                 </>
//                             )}
//                             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                         </label>
//                         <p className="text-sm text-slate-400">This helps us analyze letter formation and spacing.</p>
//                     </div>
//                 </div>
//             </AssessmentShell>
//         );
//     }

//     // ── Question step ─────────────────────────────────────────────────────────
//     const currentQuestion = questions[currentStep];
//     const currentAnswer   = answers[currentQuestion.id] || "";

//     return (
//         <AssessmentShell
//             title="Dyslexia Assessment"
//             currentStep={currentStep}
//             totalSteps={questions.length + 1}
//             onNext={handleNext}
//             onBack={handleBack}
//             isNextDisabled={!currentAnswer}
//         >
//             <div className="flex flex-col gap-6">
//                 <div className="flex justify-between items-center">
//                     <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-100 px-2 py-1 rounded">
//                         {currentQuestion.category}
//                     </span>
//                 </div>

//                 <h3 className="text-xl font-medium text-slate-800 dark:text-white">
//                     {currentQuestion.question}
//                 </h3>

//                 {currentQuestion.type === "choice" && (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {currentQuestion.options?.map((option,idx) => (
//                             <button
//                                 key={`${currentQuestion.id}-${idx}`}
//                                 onClick={() => handleAnswer(option)}
//                                 className={`p-4 rounded-xl border-2 transition-all text-left ${
//                                 currentAnswer === option
//                                     ? "border-violet-500 bg-violet-500/20 text-violet-300"
//                                     : "border-slate-600 text-slate-300 hover:border-violet-400 hover:bg-violet-500/10"
//                             }`}
//                             >
//                                 {option}
//                             </button>
//                         ))}
//                     </div>
//                 )}

//                 {currentQuestion.type === "text" && (
//                     <input
//                         type="text"
//                         value={currentAnswer}
//                         onChange={e => handleAnswer(e.target.value)}
//                         className="w-full p-4 text-black rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-all"
//                         placeholder="Type your answer here..."
//                     />
//                 )}
//             </div>
//         </AssessmentShell>
//     );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/db";
import { predictDyslexia, DyslexiaSignals } from "@/services/AiDiagnosis";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
    id: string;
    type: "text" | "choice";
    question: string;
    options?: string[];
    correctAnswer: string;
    category: "spelling" | "phonetics" | "visual" | "memory";
    difficulty?: "easy" | "medium" | "hard";
}

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

// ─── Client-side phonetics validator ─────────────────────────────────────────
// Catches cases where Groq generates multiple options that satisfy the question.
// e.g. "Which starts with sh?" but options include both "shoe" and "shop".

function getSoundPrefix(word: string): string {
    const w = word.toLowerCase().trim();
    // Common digraphs and blends to check first (order matters)
    const digraphs = ["sh","ch","th","wh","ph","gh","kn","wr","qu","bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","sc","sk","sl","sm","sn","sp","st","sw","tr","tw"];
    for (const d of digraphs) { if (w.startsWith(d)) return d; }
    return w[0] ?? "";
}

function getSoundSuffix(word: string): string {
    const w = word.toLowerCase().trim();
    const digraphs = ["sh","ch","th","ng","ck","ph"];
    for (const d of digraphs) { if (w.endsWith(d)) return d; }
    return w[w.length - 1] ?? "";
}

function validatePhoneticsQuestion(q: Question): boolean {
    if (q.category !== "phonetics" || q.type !== "choice" || !q.options) return true;
    const text = q.question.toLowerCase();
    const correct = q.correctAnswer.toLowerCase().trim();
    const options = q.options.map(o => o.toLowerCase().trim());

    // Detect "starts with X sound" questions
    const startsMatch = text.match(/starts? with (?:the )?['""]?([a-z]+)['""]?\s*sound/);
    if (startsMatch) {
        const targetSound = startsMatch[1];
        // Count how many options share the same sound prefix as the correct answer
        const correctPrefix = getSoundPrefix(correct);
        const matchingOptions = options.filter(o => getSoundPrefix(o) === correctPrefix);
        if (matchingOptions.length > 1) {
            console.warn(`❌ Phonetics validation failed: multiple options start with "${correctPrefix}" in question: "${q.question}"`);
            return false;
        }
    }

    // Detect "ends with X sound" questions
    const endsMatch = text.match(/ends? with (?:the )?['""]?([a-z]+)['""]?\s*sound/);
    if (endsMatch) {
        const correctSuffix = getSoundSuffix(correct);
        const matchingOptions = options.filter(o => getSoundSuffix(o) === correctSuffix);
        if (matchingOptions.length > 1) {
            console.warn(`❌ Phonetics validation failed: multiple options end with "${correctSuffix}"`);
            return false;
        }
    }

    // Detect "rhymes with X" questions
    const rhymeMatch = text.match(/rhymes? with ['""]?([a-z]+)['""]?/);
    if (rhymeMatch) {
        const targetWord = rhymeMatch[1];
        const targetEnding = targetWord.slice(-3); // last 3 chars as rhyme proxy
        const matchingOptions = options.filter(o => o.endsWith(targetEnding) && o !== targetWord);
        if (matchingOptions.length > 1) {
            console.warn(`❌ Phonetics validation: multiple rhyme options found`);
            return false;
        }
    }

    return true;
}

function extractJsonArray(raw: string): string {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        const inner = fenceMatch[1].trim();
        const arrMatch = inner.match(/\[[\s\S]*\]/);
        if (arrMatch) return arrMatch[0];
    }
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    return arrMatch ? arrMatch[0] : "[]";
}

async function fetchQuestionsFromGroq(difficulty: "easy" | "medium" | "hard" = "medium"): Promise<Question[]> {
    const seed = Math.random().toString(36).slice(2, 9);
    const difficultyNote = difficulty === "easy"
        ? "Use simple, common words. Ages 8–12."
        : difficulty === "hard"
        ? "Use complex, less common words with tricky patterns. Ages 16–30."
        : "Use moderately common words. Ages 12–18.";

    const prompt = `Unique session seed (ignore): ${seed}

You are generating a dyslexia screening assessment. Difficulty level: ${difficulty.toUpperCase()}. ${difficultyNote}
Generate EXACTLY 20 questions — 5 from each of these 4 categories: spelling, phonetics, visual, memory.

CATEGORY RULES:
- "spelling": multiple-choice — only one option correctly spelled. The 3 wrong options must be clearly misspelled, never alternative correct spellings.
- "phonetics": multiple-choice about starting sounds, ending sounds, or rhymes. Always 4 options.
  *** PHONETICS RULE: Exactly ONE option must be correct. Verify every option before including. ***
  BAD: "Which word starts with the 'sh' sound?" with [shoe, shop, chip, trip] — WRONG, shoe AND shop both start with sh.
  GOOD: "Which word starts with the 'sh' sound?" with [ship, chip, trip, skip] — only ship starts with sh.
  After writing each phonetics question, re-read all 4 options and confirm ONLY 1 satisfies it. Replace any duplicate.
- "visual": multiple-choice about letter/shape confusion (b/d/p/q), mirror reversals, sequences. Always 4 options.
- "memory": short read-then-answer questions. type="text". correctAnswer is a SINGLE word.

STRICT RULES:
1. Return ONLY a raw JSON array. No markdown, no explanation.
2. Every question must have: id (q1–20), type, category, difficulty:"${difficulty}", question, correctAnswer.
3. "choice" questions MUST have "options" array of exactly 4 strings.
4. "text" questions must NOT have "options".
5. correctAnswer must EXACTLY match one of the options (for choice) or be a single lowercase word (for text).
6. Make questions VARIED — use fresh words every time.
7. PHONETICS SELF-CHECK: After each phonetics question, re-read all 4 options and confirm only 1 satisfies the question.
8. For visual questions, include the actual letters, e.g. "Which of these is the letter d? → options: b, d, p, q"

Return only the JSON array.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a helpful assistant. Respond with raw JSON only — no markdown, no code fences." },
                { role: "user", content: prompt },
            ],
            temperature: 0.85,
            max_tokens: 4000,
        }),
    });

    if (!res.ok) throw new Error(`Groq error ${res.status}`);
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content || "[]";

    try {
        const parsed = JSON.parse(extractJsonArray(raw));
        if (!Array.isArray(parsed) || parsed.length === 0) return [];
        const valid = parsed.filter((q: Question) =>
            q.id && q.type && q.category && q.question && q.correctAnswer &&
            (q.type === "text" || (q.type === "choice" && Array.isArray(q.options) && q.options.length >= 2))
        );

        // Client-side guard: drop any phonetics questions with ambiguous option sets
        const invalidCount = valid.filter((q: Question) => !validatePhoneticsQuestion(q)).length;
        if (invalidCount > 0) {
            console.warn(`Dropped ${invalidCount} phonetics question(s) with duplicate-sound options.`);
        }
        return valid.filter((q: Question) => validatePhoneticsQuestion(q));
    } catch {
        return [];
    }
}

// ─── Adaptive difficulty tracker ──────────────────────────────────────────────
function calcAdaptiveDifficulty(recentResults: boolean[]): "easy" | "medium" | "hard" {
    if (recentResults.length < 3) return "medium";
    const last3 = recentResults.slice(-3);
    const correct = last3.filter(Boolean).length;
    if (correct === 3) return "hard";    // 3/3 right → harder
    if (correct === 0) return "easy";   // 0/3 right → easier
    return "medium";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DyslexiaTest({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();

    const [questions, setQuestions]   = useState<Question[]>([]);
    const [loading, setLoading]       = useState(true);
    const [loadError, setLoadError]   = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers]       = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);

    // ── New: tracking signals ─────────────────────────────────────────────────
    const [questionTimes, setQuestionTimes]   = useState<Record<string, number>>({});
    const [answerChanges, setAnswerChanges]   = useState<Record<string, number>>({});
    const [recentResults, setRecentResults]   = useState<boolean[]>([]);
    const questionStartRef = useRef<number>(Date.now());

    const loadQuestions = () => {
        setLoading(true);
        setLoadError("");
        fetchQuestionsFromGroq("medium")
            .then(data => {
                if (!data.length) throw new Error("No questions returned.");
                setQuestions(data);
                setLoading(false);
                questionStartRef.current = Date.now();
            })
            .catch(e => {
                console.error(e);
                setLoadError("Couldn't load assessment questions. Please try again.");
                setLoading(false);
            });
    };

    useEffect(() => { loadQuestions(); }, []);

    // Reset per-question timer when step changes
    useEffect(() => {
        questionStartRef.current = Date.now();
    }, [currentStep]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    // For multiple-choice: count deliberate selection changes (clicking a different option)
    const handleChoiceAnswer = (answer: string) => {
        const q = questions[currentStep];
        if (!q) return;
        if (answers[q.id] !== undefined && answers[q.id] !== "" && answers[q.id] !== answer) {
            setAnswerChanges(prev => ({ ...prev, [q.id]: (prev[q.id] || 0) + 1 }));
        }
        setAnswers(prev => ({ ...prev, [q.id]: answer }));
    };

    // For text inputs: only count backspace/delete as "answer changes" (deliberate deletion)
    const handleTextAnswer = (answer: string) => {
        const q = questions[currentStep];
        if (!q) return;
        setAnswers(prev => ({ ...prev, [q.id]: answer }));
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const q = questions[currentStep];
        if (!q) return;
        if (e.key === "Backspace" || e.key === "Delete") {
            const currentVal = answers[q.id] || "";
            // Only count as a "deletion change" if they had typed something meaningful (>2 chars)
            if (currentVal.length > 2) {
                setAnswerChanges(prev => ({ ...prev, [q.id]: (prev[q.id] || 0) + 1 }));
            }
        }
    };

    const recordTimeAndAdvance = () => {
        const q = questions[currentStep];
        if (q) {
            const elapsed = Date.now() - questionStartRef.current;
            setQuestionTimes(prev => ({ ...prev, [q.id]: elapsed }));
            // Track correctness for adaptive difficulty
            const isCorrect = (answers[q.id] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
            setRecentResults(prev => [...prev, isCorrect]);
        }
    };

    const handleNext = () => {
        recordTimeAndAdvance();
        if (currentStep < questions.length - 1) {
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

        // Build signals for the new evidence-based engine
        const correctAnswers: Record<string, string> = {};
        const categories: Record<string, "spelling" | "phonetics" | "visual" | "memory"> = {};
        questions.forEach(q => {
            correctAnswers[q.id] = q.correctAnswer;
            categories[q.id] = q.category;
        });

        const signals: DyslexiaSignals = {
            answers,
            correctAnswers,
            categories,
            questionTimes,
            answerChanges,
            totalQuestions: questions.length,
        };

        const result = predictDyslexia(signals);
        console.log("Dyslexia screening result:", result);

        // Simple total score for DB
        let score = 0;
        questions.forEach(q => {
            if ((answers[q.id] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) score++;
        });

        if (user) {
            await db.assessments.add({
                userId: user.id,
                type: "dyslexia",
                score,
                total: questions.length,
                risk: result.risk as any,
                details: {
                    answers,
                    questionTimes,
                    answerChanges,
                    categoryScores: result.categoryScores,
                    riskScore: result.score,
                    breakdown: result.breakdown,
                    flags: result.flags,
                    aiProbability: result.probability,
                },
                date: new Date().toISOString(),
            });
        }

        setTimeout(() => { onComplete ? onComplete() : router.push("/report"); }, 1500);
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-6">
            <div className="text-6xl animate-bounce">🧠</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Preparing your assessment…</h2>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Generating 20 adaptive questions via Groq ⚡</p>
        </div>
    );

    if (loadError) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-5">
            <div className="text-5xl">😕</div>
            <p className="text-xl font-bold text-red-600">{loadError}</p>
            <button onClick={loadQuestions} className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all">Try Again 🔄</button>
        </div>
    );

    if (isFinished) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete! ✓</h2>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-300">Saving results…</p>
        </div>
    );

    const currentQuestion = questions[currentStep];
    const currentAnswer   = answers[currentQuestion?.id] || "";
    const progress        = ((currentStep + 1) / questions.length) * 100;

    // Category colours
    const catColors: Record<string, string> = {
        spelling:  "text-blue-600 bg-blue-100 border-blue-200",
        phonetics: "text-purple-600 bg-purple-100 border-purple-200",
        visual:    "text-amber-600 bg-amber-100 border-amber-200",
        memory:    "text-green-600 bg-green-100 border-green-200",
    };
    const catColor = catColors[currentQuestion?.category] || "text-violet-600 bg-violet-100 border-violet-200";

    return (
        <AssessmentShell
            title="Dyslexia Screening"
            currentStep={currentStep}
            totalSteps={questions.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!currentAnswer}
        >
            <div className="flex flex-col gap-6">
                {/* Progress details */}
                <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${catColor}`}>
                        {currentQuestion?.category}
                    </span>
                    <span className="text-xs text-slate-400">
                        Question {currentStep + 1} of {questions.length}
                    </span>
                </div>

                {/* Per-category mini progress bars */}
                <div className="flex gap-1">
                    {(["spelling","phonetics","visual","memory"] as const).map(cat => {
                        const catQs = questions.filter(q => q.category === cat);
                        const answered = catQs.filter(q => answers[q.id]).length;
                        return (
                            <div key={cat} className="flex-1">
                                <div className="text-xs text-slate-400 mb-1 text-center">{cat[0].toUpperCase()}</div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full transition-all"
                                        style={{ width: `${(answered/catQs.length)*100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Question */}
                <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-relaxed">
                    {currentQuestion?.question}
                </h3>

                {/* Choice */}
                {currentQuestion?.type === "choice" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentQuestion.options?.map((option, idx) => (
                            <button
                                key={`${currentQuestion.id}-${idx}`}
                                onClick={() => handleChoiceAnswer(option)}
                                className={`p-4 rounded-xl border-2 transition-all text-left font-medium text-base ${
                                    currentAnswer === option
                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                        : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-600"
                                }`}
                            >
                                <span className="inline-block w-6 h-6 rounded-full border border-current mr-2 text-center text-xs leading-6 font-bold">
                                    {["A","B","C","D"][idx]}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {/* Text */}
                {currentQuestion?.type === "text" && (
                    <input
                        type="text"
                        value={currentAnswer}
                        onChange={e => handleTextAnswer(e.target.value)}
                        onKeyDown={handleTextKeyDown}
                        className="w-full p-4 text-black dark:text-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-violet-500 focus:outline-none transition-all text-lg"
                        placeholder="Type your answer here…"
                        autoComplete="off"
                    />
                )}

                {/* Hint: only show for choice questions after 2+ deliberate switches */}
                {currentQuestion?.type === "choice" && (answerChanges[currentQuestion?.id] || 0) >= 2 && (
                    <p className="text-xs text-amber-500">
                        Changed answer {answerChanges[currentQuestion.id]} time(s) — take your time!
                    </p>
                )}
            </div>
        </AssessmentShell>
    );
}