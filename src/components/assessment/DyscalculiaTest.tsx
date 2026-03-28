"use client";

import { useState, useEffect } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/db/db";
import { aiDiagnosis } from "@/services/AiDiagnosis";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
    id: string;
    type: "choice";
    category: "arithmetic" | "sequence" | "word_problem" | "estimation";
    question: string;
    options: string[];
    correctAnswer: string;
}

// ─── Question Bank ────────────────────────────────────────────────────────────
const QUESTION_BANK: Question[] = [
    // Arithmetic
    { id: "a1", type: "choice", category: "arithmetic",   question: "What is 5 + 3?",                                                              options: ["7", "8", "9", "6"],                          correctAnswer: "8"         },
    { id: "a2", type: "choice", category: "arithmetic",   question: "What is 12 - 4?",                                                             options: ["6", "8", "7", "9"],                          correctAnswer: "8"         },
    { id: "a3", type: "choice", category: "arithmetic",   question: "What is 3 × 4?",                                                              options: ["12", "14", "10", "15"],                      correctAnswer: "12"        },
    { id: "a4", type: "choice", category: "arithmetic",   question: "What is 20 ÷ 5?",                                                             options: ["2", "4", "5", "10"],                         correctAnswer: "4"         },
    { id: "a5", type: "choice", category: "arithmetic",   question: "What is 15 + 6?",                                                             options: ["20", "21", "22", "19"],                      correctAnswer: "21"        },
    // Sequences
    { id: "s1", type: "choice", category: "sequence",     question: "2, 4, 6, 8, … what comes next?",                                             options: ["9", "10", "11", "12"],                       correctAnswer: "10"        },
    { id: "s2", type: "choice", category: "sequence",     question: "5, 10, 15, … what comes next?",                                              options: ["20", "25", "18", "30"],                      correctAnswer: "20"        },
    { id: "s3", type: "choice", category: "sequence",     question: "10, 9, 8, … what comes next?",                                               options: ["6", "7", "5", "8"],                          correctAnswer: "7"         },
    { id: "s4", type: "choice", category: "sequence",     question: "1, 3, 5, 7, … what comes next?",                                             options: ["8", "9", "10", "11"],                        correctAnswer: "9"         },
    { id: "s5", type: "choice", category: "sequence",     question: "3, 6, 9, … what comes next?",                                                options: ["10", "11", "12", "13"],                      correctAnswer: "12"        },
    // Word Problems
    { id: "w1", type: "choice", category: "word_problem", question: "If you have 3 apples and get 2 more, how many do you have?",                  options: ["4", "5", "6", "3"],                          correctAnswer: "5"         },
    { id: "w2", type: "choice", category: "word_problem", question: "Sam has 10 coins. He spends 3. How many are left?",                           options: ["8", "7", "6", "5"],                          correctAnswer: "7"         },
    { id: "w3", type: "choice", category: "word_problem", question: "A box has 4 sides. How many sides do 2 boxes have?",                          options: ["6", "8", "10", "12"],                        correctAnswer: "8"         },
    { id: "w4", type: "choice", category: "word_problem", question: "There are 5 birds. 2 fly away. How many stay?",                               options: ["2", "3", "4", "5"],                          correctAnswer: "3"         },
    { id: "w5", type: "choice", category: "word_problem", question: "You buy a toy for $5. You give $10. What is your change?",                    options: ["$5", "$4", "$6", "$3"],                      correctAnswer: "$5"        },
    // Estimation / Visual
    { id: "e1", type: "choice", category: "estimation",   question: "Which group has more dots: Group A (5) or Group B (9)?",                      options: ["Group A (5)", "Group B (9)"],                 correctAnswer: "Group B (9)"},
    { id: "e2", type: "choice", category: "estimation",   question: "Is 50 closer to 0 or 100?",                                                   options: ["0", "100"],                                  correctAnswer: "100"       },
    { id: "e3", type: "choice", category: "estimation",   question: "Which is larger: 10 or 100?",                                                 options: ["10", "100"],                                 correctAnswer: "100"       },
    { id: "e4", type: "choice", category: "estimation",   question: "How many fingers do you have on one hand?",                                   options: ["4", "5", "6", "10"],                         correctAnswer: "5"         },
    { id: "e5", type: "choice", category: "estimation",   question: "What time is it if the small hand is on 3 and the big hand is on 12?",        options: ["3:00", "12:00", "3:30", "12:15"],            correctAnswer: "3:00"      },
];

// ─── Shuffle helper ───────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DyscalculiaTest({ onComplete }: { onComplete?: () => void }) {
    const router               = useRouter();
    const { user }             = useAuth();

    const [questions, setQuestions]   = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers]       = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [startTime]                 = useState(Date.now());

    // Pick 10 random questions on mount
    useEffect(() => {
        setQuestions(pickRandom(QUESTION_BANK, 10));
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleAnswer = (answer: string) => {
        if (!questions[currentStep]) return;
        setAnswers(prev => ({ ...prev, [questions[currentStep].id]: answer }));
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishAssessment();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    // ── Finish ────────────────────────────────────────────────────────────────
    const finishAssessment = async () => {
        setIsFinished(true);

        let score = 0;
        const categoryScores: Record<string, { total: number; correct: number }> = {};

        questions.forEach(q => {
            if (!categoryScores[q.category]) categoryScores[q.category] = { total: 0, correct: 0 };
            categoryScores[q.category].total++;
            if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                score++;
                categoryScores[q.category].correct++;
            }
        });

        const timeTaken  = (Date.now() - startTime) / 1000;
        const prediction = aiDiagnosis.predictDyscalculia(score, questions.length, timeTaken);
        console.log("AI Prediction (Dyscalculia):", prediction);

        if (user) {
            await db.assessments.add({
                userId: user.id,
                type:   "dyscalculia",
                score,
                total:  questions.length,
                risk:   prediction.risk as any,
                details: {
                    answers,
                    categoryScores,
                    timeTaken,
                    aiProbability: prediction.probability,
                },
                date: new Date().toISOString(),
            });
        }

        setTimeout(() => {
            if (onComplete) onComplete();
            else router.push("/report");
        }, 1500);
    };

    // ── Guards ────────────────────────────────────────────────────────────────
    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Assessment Complete!</h2>
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg text-slate-600 dark:text-slate-300">Finalizing your profile…</p>
            </div>
        );
    }

    // ── Question step ─────────────────────────────────────────────────────────
    const currentQuestion = questions[currentStep];
    const currentAnswer   = answers[currentQuestion.id] || "";

    return (
        <AssessmentShell
            title="Dyscalculia Assessment"
            currentStep={currentStep}
            totalSteps={questions.length}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!currentAnswer}
        >
            <div className="flex flex-col gap-6">

                {/* Category badge */}
                <div className="flex items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full">
                        {currentQuestion.category.replace("_", " ")}
                    </span>
                </div>

                {/* Question */}
                <h3 className="text-xl font-medium text-slate-800 dark:text-white">
                    {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={`${currentQuestion.id}-${idx}`}
                            onClick={() => handleAnswer(option)}
                            className={`p-4 rounded-xl border-2 transition-all text-left font-medium ${
                                currentAnswer === option
                                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                    : "border-slate-600 text-slate-300 hover:border-violet-400 hover:bg-violet-500/10"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

            </div>
        </AssessmentShell>
    );
}