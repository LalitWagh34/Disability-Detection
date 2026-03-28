// "use client";

// import { useState, useEffect } from "react";
// import { AssessmentShell } from "./AssessmentShell";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { db } from "@/db/db";
// import { aiDiagnosis } from "@/services/AiDiagnosis";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface Question {
//     id: string;
//     type: "choice";
//     category: "arithmetic" | "sequence" | "word_problem" | "estimation";
//     question: string;
//     options: string[];
//     correctAnswer: string;
// }

// // ─── Question Bank ────────────────────────────────────────────────────────────
// const QUESTION_BANK: Question[] = [
//     // Arithmetic
//     { id: "a1", type: "choice", category: "arithmetic",   question: "What is 5 + 3?",                                                              options: ["7", "8", "9", "6"],                          correctAnswer: "8"         },
//     { id: "a2", type: "choice", category: "arithmetic",   question: "What is 12 - 4?",                                                             options: ["6", "8", "7", "9"],                          correctAnswer: "8"         },
//     { id: "a3", type: "choice", category: "arithmetic",   question: "What is 3 × 4?",                                                              options: ["12", "14", "10", "15"],                      correctAnswer: "12"        },
//     { id: "a4", type: "choice", category: "arithmetic",   question: "What is 20 ÷ 5?",                                                             options: ["2", "4", "5", "10"],                         correctAnswer: "4"         },
//     { id: "a5", type: "choice", category: "arithmetic",   question: "What is 15 + 6?",                                                             options: ["20", "21", "22", "19"],                      correctAnswer: "21"        },
//     // Sequences
//     { id: "s1", type: "choice", category: "sequence",     question: "2, 4, 6, 8, … what comes next?",                                             options: ["9", "10", "11", "12"],                       correctAnswer: "10"        },
//     { id: "s2", type: "choice", category: "sequence",     question: "5, 10, 15, … what comes next?",                                              options: ["20", "25", "18", "30"],                      correctAnswer: "20"        },
//     { id: "s3", type: "choice", category: "sequence",     question: "10, 9, 8, … what comes next?",                                               options: ["6", "7", "5", "8"],                          correctAnswer: "7"         },
//     { id: "s4", type: "choice", category: "sequence",     question: "1, 3, 5, 7, … what comes next?",                                             options: ["8", "9", "10", "11"],                        correctAnswer: "9"         },
//     { id: "s5", type: "choice", category: "sequence",     question: "3, 6, 9, … what comes next?",                                                options: ["10", "11", "12", "13"],                      correctAnswer: "12"        },
//     // Word Problems
//     { id: "w1", type: "choice", category: "word_problem", question: "If you have 3 apples and get 2 more, how many do you have?",                  options: ["4", "5", "6", "3"],                          correctAnswer: "5"         },
//     { id: "w2", type: "choice", category: "word_problem", question: "Sam has 10 coins. He spends 3. How many are left?",                           options: ["8", "7", "6", "5"],                          correctAnswer: "7"         },
//     { id: "w3", type: "choice", category: "word_problem", question: "A box has 4 sides. How many sides do 2 boxes have?",                          options: ["6", "8", "10", "12"],                        correctAnswer: "8"         },
//     { id: "w4", type: "choice", category: "word_problem", question: "There are 5 birds. 2 fly away. How many stay?",                               options: ["2", "3", "4", "5"],                          correctAnswer: "3"         },
//     { id: "w5", type: "choice", category: "word_problem", question: "You buy a toy for $5. You give $10. What is your change?",                    options: ["$5", "$4", "$6", "$3"],                      correctAnswer: "$5"        },
//     // Estimation / Visual
//     { id: "e1", type: "choice", category: "estimation",   question: "Which group has more dots: Group A (5) or Group B (9)?",                      options: ["Group A (5)", "Group B (9)"],                 correctAnswer: "Group B (9)"},
//     { id: "e2", type: "choice", category: "estimation",   question: "Is 50 closer to 0 or 100?",                                                   options: ["0", "100"],                                  correctAnswer: "100"       },
//     { id: "e3", type: "choice", category: "estimation",   question: "Which is larger: 10 or 100?",                                                 options: ["10", "100"],                                 correctAnswer: "100"       },
//     { id: "e4", type: "choice", category: "estimation",   question: "How many fingers do you have on one hand?",                                   options: ["4", "5", "6", "10"],                         correctAnswer: "5"         },
//     { id: "e5", type: "choice", category: "estimation",   question: "What time is it if the small hand is on 3 and the big hand is on 12?",        options: ["3:00", "12:00", "3:30", "12:15"],            correctAnswer: "3:00"      },
// ];

// // ─── Shuffle helper ───────────────────────────────────────────────────────────
// function pickRandom<T>(arr: T[], n: number): T[] {
//     return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export function DyscalculiaTest({ onComplete }: { onComplete?: () => void }) {
//     const router               = useRouter();
//     const { user }             = useAuth();

//     const [questions, setQuestions]   = useState<Question[]>([]);
//     const [currentStep, setCurrentStep] = useState(0);
//     const [answers, setAnswers]       = useState<Record<string, string>>({});
//     const [isFinished, setIsFinished] = useState(false);
//     const [startTime]                 = useState(Date.now());

//     // Pick 10 random questions on mount
//     useEffect(() => {
//         setQuestions(pickRandom(QUESTION_BANK, 10));
//     }, []);

//     // ── Handlers ──────────────────────────────────────────────────────────────
//     const handleAnswer = (answer: string) => {
//         if (!questions[currentStep]) return;
//         setAnswers(prev => ({ ...prev, [questions[currentStep].id]: answer }));
//     };

//     const handleNext = () => {
//         if (currentStep < questions.length - 1) {
//             setCurrentStep(prev => prev + 1);
//         } else {
//             finishAssessment();
//         }
//     };

//     const handleBack = () => {
//         if (currentStep > 0) setCurrentStep(prev => prev - 1);
//     };

//     // ── Finish ────────────────────────────────────────────────────────────────
//     const finishAssessment = async () => {
//         setIsFinished(true);

//         let score = 0;
//         const categoryScores: Record<string, { total: number; correct: number }> = {};

//         questions.forEach(q => {
//             if (!categoryScores[q.category]) categoryScores[q.category] = { total: 0, correct: 0 };
//             categoryScores[q.category].total++;
//             if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
//                 score++;
//                 categoryScores[q.category].correct++;
//             }
//         });

//         const timeTaken  = (Date.now() - startTime) / 1000;
//         const prediction = aiDiagnosis.predictDyscalculia(score, questions.length, timeTaken);
//         console.log("AI Prediction (Dyscalculia):", prediction);

//         if (user) {
//             await db.assessments.add({
//                 userId: user.id,
//                 type:   "dyscalculia",
//                 score,
//                 total:  questions.length,
//                 risk:   prediction.risk as any,
//                 details: {
//                     answers,
//                     categoryScores,
//                     timeTaken,
//                     aiProbability: prediction.probability,
//                 },
//                 date: new Date().toISOString(),
//             });
//         }

//         setTimeout(() => {
//             if (onComplete) onComplete();
//             else router.push("/report");
//         }, 1500);
//     };

//     // ── Guards ────────────────────────────────────────────────────────────────
//     if (questions.length === 0) {
//         return (
//             <div className="flex items-center justify-center min-h-[50vh]">
//                 <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//         );
//     }

//     if (isFinished) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
//                 <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Assessment Complete!</h2>
//                 <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
//                 <p className="text-lg text-slate-600 dark:text-slate-300">Finalizing your profile…</p>
//             </div>
//         );
//     }

//     // ── Question step ─────────────────────────────────────────────────────────
//     const currentQuestion = questions[currentStep];
//     const currentAnswer   = answers[currentQuestion.id] || "";

//     return (
//         <AssessmentShell
//             title="Dyscalculia Assessment"
//             currentStep={currentStep}
//             totalSteps={questions.length}
//             onNext={handleNext}
//             onBack={handleBack}
//             isNextDisabled={!currentAnswer}
//         >
//             <div className="flex flex-col gap-6">

//                 {/* Category badge */}
//                 <div className="flex items-center">
//                     <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full">
//                         {currentQuestion.category.replace("_", " ")}
//                     </span>
//                 </div>

//                 {/* Question */}
//                 <h3 className="text-xl font-medium text-slate-800 dark:text-white">
//                     {currentQuestion.question}
//                 </h3>

//                 {/* Options */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {currentQuestion.options.map((option, idx) => (
//                         <button
//                             key={`${currentQuestion.id}-${idx}`}
//                             onClick={() => handleAnswer(option)}
//                             className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${
//                                 currentAnswer === option
//                                     ? "border-violet-500 bg-violet-500/20 text-violet-300"
//                                     : "border-slate-600 text-slate-300 hover:border-violet-400 hover:bg-violet-500/10"
//                             }`}
//                         >
//                             {option}
//                         </button>
//                     ))}
//                 </div>

//             </div>
//         </AssessmentShell>
//     );
// }


"use client";

import { useState, useEffect, useRef } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/db/db";
import { predictDyscalculia, DyscalculiaSignals } from "@/services/AiDiagnosis";

interface Question {
    id: string;
    type: "choice";
    category: "arithmetic" | "sequence" | "word_problem" | "estimation";
    question: string;
    options: string[];
    correctAnswer: string;
    difficulty: "easy" | "medium" | "hard";
}

// Expanded 40-question bank across all difficulty levels
const QUESTION_BANK: Question[] = [
    // ── Arithmetic ────────────────────────────────────────────────────────────
    { id:"a1",  type:"choice", category:"arithmetic",   difficulty:"easy",   question:"What is 5 + 3?",                  options:["7","8","9","6"],                     correctAnswer:"8" },
    { id:"a2",  type:"choice", category:"arithmetic",   difficulty:"easy",   question:"What is 12 - 4?",                 options:["6","8","7","9"],                     correctAnswer:"8" },
    { id:"a3",  type:"choice", category:"arithmetic",   difficulty:"easy",   question:"What is 3 × 4?",                  options:["12","14","10","15"],                 correctAnswer:"12" },
    { id:"a4",  type:"choice", category:"arithmetic",   difficulty:"easy",   question:"What is 20 ÷ 5?",                 options:["2","4","5","10"],                    correctAnswer:"4" },
    { id:"a5",  type:"choice", category:"arithmetic",   difficulty:"easy",   question:"What is 15 + 6?",                 options:["20","21","22","19"],                 correctAnswer:"21" },
    { id:"a6",  type:"choice", category:"arithmetic",   difficulty:"medium", question:"What is 47 + 38?",                options:["75","85","84","86"],                 correctAnswer:"85" },
    { id:"a7",  type:"choice", category:"arithmetic",   difficulty:"medium", question:"What is 63 - 28?",                options:["35","45","34","36"],                 correctAnswer:"35" },
    { id:"a8",  type:"choice", category:"arithmetic",   difficulty:"medium", question:"What is 7 × 8?",                  options:["54","56","58","64"],                 correctAnswer:"56" },
    { id:"a9",  type:"choice", category:"arithmetic",   difficulty:"medium", question:"What is 144 ÷ 12?",               options:["11","12","13","14"],                 correctAnswer:"12" },
    { id:"a10", type:"choice", category:"arithmetic",   difficulty:"hard",   question:"What is 15² − 6²?",               options:["189","189","195","181"],             correctAnswer:"189" },
    { id:"a11", type:"choice", category:"arithmetic",   difficulty:"hard",   question:"What is 25% of 240?",             options:["48","60","50","56"],                 correctAnswer:"60" },
    { id:"a12", type:"choice", category:"arithmetic",   difficulty:"hard",   question:"If a = 6 and b = 9, what is 2a + b?", options:["21","15","18","24"],            correctAnswer:"21" },

    // ── Sequences ────────────────────────────────────────────────────────────
    { id:"s1",  type:"choice", category:"sequence",     difficulty:"easy",   question:"2, 4, 6, 8, … next?",            options:["9","10","11","12"],                  correctAnswer:"10" },
    { id:"s2",  type:"choice", category:"sequence",     difficulty:"easy",   question:"5, 10, 15, … next?",             options:["20","25","18","30"],                 correctAnswer:"20" },
    { id:"s3",  type:"choice", category:"sequence",     difficulty:"easy",   question:"10, 9, 8, … next?",              options:["6","7","5","8"],                     correctAnswer:"7" },
    { id:"s4",  type:"choice", category:"sequence",     difficulty:"easy",   question:"1, 3, 5, 7, … next?",            options:["8","9","10","11"],                   correctAnswer:"9" },
    { id:"s5",  type:"choice", category:"sequence",     difficulty:"medium", question:"2, 6, 18, 54, … next?",          options:["108","162","216","180"],             correctAnswer:"162" },
    { id:"s6",  type:"choice", category:"sequence",     difficulty:"medium", question:"1, 4, 9, 16, … next?",           options:["20","25","36","24"],                 correctAnswer:"25" },
    { id:"s7",  type:"choice", category:"sequence",     difficulty:"medium", question:"3, 7, 13, 21, 31, … next?",      options:["41","43","45","47"],                 correctAnswer:"43" },
    { id:"s8",  type:"choice", category:"sequence",     difficulty:"hard",   question:"2, 3, 5, 8, 13, 21, … next?",   options:["30","34","33","28"],                 correctAnswer:"34" },
    { id:"s9",  type:"choice", category:"sequence",     difficulty:"hard",   question:"What is missing: 64, _, 16, 4", options:["32","8","24","48"],                  correctAnswer:"32" },
    { id:"s10", type:"choice", category:"sequence",     difficulty:"hard",   question:"100, 91, 83, 76, 70, … next?",  options:["65","64","63","66"],                 correctAnswer:"65" },

    // ── Word Problems ─────────────────────────────────────────────────────────
    { id:"w1",  type:"choice", category:"word_problem", difficulty:"easy",   question:"You have 3 apples and get 2 more. How many?",                           options:["4","5","6","3"],              correctAnswer:"5" },
    { id:"w2",  type:"choice", category:"word_problem", difficulty:"easy",   question:"Sam has 10 coins. He spends 3. How many left?",                         options:["8","7","6","5"],              correctAnswer:"7" },
    { id:"w3",  type:"choice", category:"word_problem", difficulty:"easy",   question:"5 birds. 2 fly away. How many stay?",                                   options:["2","3","4","5"],              correctAnswer:"3" },
    { id:"w4",  type:"choice", category:"word_problem", difficulty:"medium", question:"A box of 24 pencils is shared equally by 6 students. How many each?",   options:["3","4","5","6"],              correctAnswer:"4" },
    { id:"w5",  type:"choice", category:"word_problem", difficulty:"medium", question:"Train A travels 60 km/h, train B 90 km/h. After 2 hours, how far ahead is B?", options:["60km","90km","30km","120km"], correctAnswer:"60km" },
    { id:"w6",  type:"choice", category:"word_problem", difficulty:"medium", question:"A shirt costs $35. There is a 20% discount. Final price?",              options:["$25","$28","$30","$32"],      correctAnswer:"$28" },
    { id:"w7",  type:"choice", category:"word_problem", difficulty:"hard",   question:"5 workers finish a job in 8 days. How long for 10 workers?",            options:["4 days","16 days","6 days","3 days"], correctAnswer:"4 days" },
    { id:"w8",  type:"choice", category:"word_problem", difficulty:"hard",   question:"A tank fills in 6h via pipe A, 4h via pipe B. Together?",               options:["2.4h","5h","3h","10h"],      correctAnswer:"2.4h" },

    // ── Estimation / Number Sense ─────────────────────────────────────────────
    { id:"e1",  type:"choice", category:"estimation",   difficulty:"easy",   question:"Which group has more: Group A (5 dots) or Group B (9 dots)?",          options:["Group A","Group B"],          correctAnswer:"Group B" },
    { id:"e2",  type:"choice", category:"estimation",   difficulty:"easy",   question:"Is 50 closer to 0 or 100?",                                             options:["0","100"],                   correctAnswer:"100" },
    { id:"e3",  type:"choice", category:"estimation",   difficulty:"easy",   question:"Which is larger: ½ or ¼?",                                             options:["¼","½"],                     correctAnswer:"½" },
    { id:"e4",  type:"choice", category:"estimation",   difficulty:"medium", question:"Approximately, what is 198 × 3?",                                       options:["400","500","600","700"],      correctAnswer:"600" },
    { id:"e5",  type:"choice", category:"estimation",   difficulty:"medium", question:"Which fraction is closest to 1: 7/8, 3/4, 2/3, or 4/5?",               options:["3/4","2/3","4/5","7/8"],     correctAnswer:"7/8" },
    { id:"e6",  type:"choice", category:"estimation",   difficulty:"medium", question:"Is 0.75 greater than, less than, or equal to 3/4?",                    options:["Greater","Less","Equal"],    correctAnswer:"Equal" },
    { id:"e7",  type:"choice", category:"estimation",   difficulty:"hard",   question:"Estimate: √48 is closest to…",                                         options:["5","6","7","8"],              correctAnswer:"7" },
    { id:"e8",  type:"choice", category:"estimation",   difficulty:"hard",   question:"A car uses 8L per 100km. Approx. cost for 250km at $1.80/L?",           options:["$30","$36","$45","$20"],     correctAnswer:"$36" },
];

function pickBalanced(bank: Question[], n: number): Question[] {
    const cats = ["arithmetic","sequence","word_problem","estimation"] as const;
    const perCat = Math.floor(n / cats.length);
    const result: Question[] = [];
    for (const cat of cats) {
        const pool = bank.filter(q => q.category === cat);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        result.push(...shuffled.slice(0, perCat));
    }
    return result.sort(() => Math.random() - 0.5);
}

export function DyscalculiaTest({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();

    const [questions, setQuestions]   = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers]       = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);

    // Tracking signals
    const [questionTimes, setQuestionTimes]   = useState<Record<string, number>>({});
    const [answerChanges, setAnswerChanges]   = useState<Record<string, number>>({});
    const questionStartRef = useRef<number>(Date.now());

    useEffect(() => {
        setQuestions(pickBalanced(QUESTION_BANK, 20));
    }, []);

    useEffect(() => {
        questionStartRef.current = Date.now();
    }, [currentStep]);

    const handleAnswer = (answer: string) => {
        const q = questions[currentStep];
        if (!q) return;
        if (answers[q.id] && answers[q.id] !== answer) {
            setAnswerChanges(prev => ({ ...prev, [q.id]: (prev[q.id] || 0) + 1 }));
        }
        setAnswers(prev => ({ ...prev, [q.id]: answer }));
    };

    const recordAndAdvance = () => {
        const q = questions[currentStep];
        if (q) setQuestionTimes(prev => ({ ...prev, [q.id]: Date.now() - questionStartRef.current }));
    };

    const handleNext = () => {
        recordAndAdvance();
        if (currentStep < questions.length - 1) setCurrentStep(p => p + 1);
        else finishAssessment();
    };
    const handleBack = () => { if (currentStep > 0) setCurrentStep(p => p - 1); };

    const finishAssessment = async () => {
        setIsFinished(true);

        const correctAnswers: Record<string, string> = {};
        const categories: Record<string, "arithmetic" | "sequence" | "word_problem" | "estimation"> = {};
        questions.forEach(q => { correctAnswers[q.id] = q.correctAnswer; categories[q.id] = q.category; });

        const signals: DyscalculiaSignals = { answers, correctAnswers, categories, questionTimes, answerChanges, totalQuestions: questions.length };
        const result = predictDyscalculia(signals);

        let score = 0;
        questions.forEach(q => { if ((answers[q.id]||"").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) score++; });

        if (user) {
            await db.assessments.add({
                userId: user.id, type: "dyscalculia", score, total: questions.length,
                risk: result.risk as any,
                details: { answers, questionTimes, answerChanges, categoryScores: result.categoryScores, riskScore: result.score, breakdown: result.breakdown, flags: result.flags, aiProbability: result.probability },
                date: new Date().toISOString(),
            });
        }

        setTimeout(() => { onComplete ? onComplete() : router.push("/report"); }, 1500);
    };

    if (questions.length === 0) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (isFinished) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Assessment Complete! ✓</h2>
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-slate-600 dark:text-slate-300">Finalizing your profile…</p>
        </div>
    );

    const q = questions[currentStep];
    const currentAnswer = answers[q.id] || "";

    const catColors: Record<string, string> = {
        arithmetic:   "text-blue-600 bg-blue-100 border-blue-200",
        sequence:     "text-purple-600 bg-purple-100 border-purple-200",
        word_problem: "text-amber-600 bg-amber-100 border-amber-200",
        estimation:   "text-green-600 bg-green-100 border-green-200",
    };

    const difficultyLabel: Record<string, string> = { easy: "⬤ Easy", medium: "⬤ Medium", hard: "⬤ Hard" };
    const difficultyColor: Record<string, string> = { easy: "text-green-500", medium: "text-amber-500", hard: "text-red-500" };

    return (
        <AssessmentShell
            title="Dyscalculia Screening"
            currentStep={currentStep}
            totalSteps={questions.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!currentAnswer}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${catColors[q.category]}`}>
                        {q.category.replace("_"," ")}
                    </span>
                    <span className={`text-xs font-medium ${difficultyColor[q.difficulty]}`}>
                        {difficultyLabel[q.difficulty]}
                    </span>
                </div>

                {/* Category progress bars */}
                <div className="flex gap-1">
                    {(["arithmetic","sequence","word_problem","estimation"] as const).map(cat => {
                        const catQs = questions.filter(q => q.category === cat);
                        const answered = catQs.filter(q => answers[q.id]).length;
                        const labels: Record<string,string> = { arithmetic:"Arith", sequence:"Seq", word_problem:"Word", estimation:"Est" };
                        return (
                            <div key={cat} className="flex-1">
                                <div className="text-xs text-slate-400 mb-1 text-center">{labels[cat]}</div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(answered/catQs.length)*100}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h3 className="text-xl font-medium text-slate-800 dark:text-white leading-relaxed">{q.question}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((option, idx) => (
                        <button
                            key={`${q.id}-${idx}`}
                            onClick={() => handleAnswer(option)}
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

                {(answerChanges[q.id] || 0) > 0 && (
                    <p className="text-xs text-amber-500">Answer changed {answerChanges[q.id]} time(s) — take your time!</p>
                )}
            </div>
        </AssessmentShell>
    );
}