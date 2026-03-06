"use client";

import { useState, useEffect } from "react";
import { AssessmentShell } from "./AssessmentShell";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/db/db";

interface Question {
    id: string;
    type: "text" | "choice";
    question: string;
    options?: string[];
    correctAnswer: string;
    category: "spelling" | "phonetics" | "visual" | "memory";
}

const QUESTION_BANK: Question[] = [
    // Spelling
    { id: "s1", type: "choice", category: "spelling", question: "Which word is spelled correctly?", options: ["Recieve", "Receive", "Receve", "Riceive"], correctAnswer: "Receive" },
    { id: "s2", type: "choice", category: "spelling", question: "Choose the correct spelling:", options: ["Necessary", "Neccessary", "Necesary", "Necessery"], correctAnswer: "Necessary" },
    { id: "s3", type: "choice", category: "spelling", question: "Pick the right word:", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], correctAnswer: "Accommodate" },
    { id: "s4", type: "choice", category: "spelling", question: "Select the correct form:", options: ["Definately", "Definitely", "Definitly", "Definetly"], correctAnswer: "Definitely" },
    { id: "s5", type: "choice", category: "spelling", question: "Which is correct?", options: ["Seperate", "Separate", "Seperat", "Separat"], correctAnswer: "Separate" },

    // Visual / Letter Confusion
    { id: "v1", type: "choice", category: "visual", question: "Select the letter that looks different:", options: ["p", "q", "b", "d"], correctAnswer: "d" }, // Context dependent, but simplicity for now
    { id: "v2", type: "choice", category: "visual", question: "Which letter is flipped?", options: ["b", "d", "p", "q"], correctAnswer: "b" }, // Simplistic placeholder
    { id: "v3", type: "choice", category: "visual", question: "Select the shape that matches the pattern:", options: ["△", "▽", "◁", "▷"], correctAnswer: "△" },
    { id: "v4", type: "choice", category: "visual", question: "Which sequence is identical to 'bdpq'?", options: ["dbqp", "bdpq", "pqbd", "qbdp"], correctAnswer: "bdpq" },
    { id: "v5", type: "choice", category: "visual", question: "Find the odd one out:", options: ["WM", "MW", "VV", "NN"], correctAnswer: "NN" },

    // Phonetics / Rhyme
    { id: "p1", type: "choice", category: "phonetics", question: "Which word rhymes with 'Cat'?", options: ["Bat", "Cot", "Cut", "Cart"], correctAnswer: "Bat" },
    { id: "p2", type: "choice", category: "phonetics", question: "Select the word that sounds like 'Phone':", options: ["Gone", "Bone", "Done", "None"], correctAnswer: "Bone" },
    { id: "p3", type: "choice", category: "phonetics", question: "Rhyme for 'Light':", options: ["Late", "Lint", "Bright", "Lit"], correctAnswer: "Bright" },
    { id: "p4", type: "choice", category: "phonetics", question: "Which word starts with the same sound as 'Ship'?", options: ["Sip", "Chip", "Shop", "Hip"], correctAnswer: "Shop" },
    { id: "p5", type: "choice", category: "phonetics", question: "Ending sound of 'Dog' matches:", options: ["Fog", "Dock", "Dot", "Don"], correctAnswer: "Fog" },

    // Memory / Reading
    { id: "m1", type: "text", category: "memory", question: "Read: 'The quick brown fox.' Type the last word.", correctAnswer: "fox" },
    { id: "m2", type: "text", category: "memory", question: "Read: 'She sells sea shells.' Type the second word.", correctAnswer: "sells" },
    { id: "m3", type: "text", category: "memory", question: "Read: 'Blue sky, green grass.' Type the color of the grass.", correctAnswer: "green" },
    { id: "m4", type: "text", category: "memory", question: "Read: 'One, two, buckle my shoe.' Type the number word.", correctAnswer: "two" }, // Accept one or two
    { id: "m5", type: "text", category: "memory", question: "Read: 'Apples are red.' Type the fruit name.", correctAnswer: "Apples" },
];

import { aiDiagnosis } from "@/services/AiDiagnosis";

export function DyslexiaTest({ onComplete }: { onComplete?: () => void }) {
    const router = useRouter();
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [handwritingImage, setHandwritingImage] = useState<string | null>(null);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        // Randomly select 10 questions (2-3 from each category)
        const shuffled = [...QUESTION_BANK].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
    }, []);

    const handleAnswer = (answer: string) => {
        if (!questions[currentStep]) return;
        setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: answer }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHandwritingImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length) { // +1 for image upload step
            setCurrentStep((prev) => prev + 1);
        } else {
            finishAssessment();
        }
    };

    const finishAssessment = async () => {
        setIsFinished(true);
        // Calculate score
        let score = 0;
        questions.forEach((q) => {
            const ans = answers[q.id]?.toLowerCase().trim();
            const correct = q.correctAnswer.toLowerCase().trim();
            // Simple check, for 'two' allow 'two' or '2' etc if needed, but stick to strict for now
            if (ans === correct) {
                score++;
            } else if (q.id === "m4" && (ans === "one" || ans === "two")) {
                if (ans === "two") score++; // Specific logic override
            }
        });

        // AI Prediction
        const timeTaken = (Date.now() - startTime) / 1000;
        const prediction = aiDiagnosis.predictDyslexia(score, questions.length, timeTaken);
        console.log("AI Prediction:", prediction);

        // Save to Dexie
        if (user) {
            await db.assessments.add({
                userId: user.id,
                type: 'dyslexia',
                score,
                total: questions.length,
                risk: prediction.risk as any,
                details: {
                    answers,
                    handwritingUploaded: !!handwritingImage,
                    aiProbability: prediction.probability,
                    timeTaken
                },
                date: new Date().toISOString()
            });
        }

        // Wait briefly for UX then redirect or callback
        setTimeout(() => {
            if (onComplete) {
                onComplete();
            } else {
                router.push("/report"); // Fallback
            }
        }, 1500);
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    if (questions.length === 0) return <div>Loading...</div>;

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">Section Complete!</h2>
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Saving results and proceeding to next assessment...
                </p>
            </div>
        );
    }

    // Last step: Image Upload (Extra step after questions)
    if (currentStep === questions.length) {
        return (
            <AssessmentShell
                title="Dyslexia Assessment - Handwriting"
                currentStep={currentStep}
                totalSteps={questions.length + 1}
                onNext={handleNext}
                onBack={handleBack}
                isNextDisabled={!handwritingImage} // Require upload? or make optional
            >
                <div className="space-y-6 text-center">
                    <h3 className="text-xl font-medium text-slate-800 dark:text-white">
                        Write "The quick brown fox" on a paper and upload a photo.
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                        <label className="w-64 h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-all">
                            {handwritingImage ? (
                                <img src={handwritingImage} alt="Uploaded" className="w-full h-full object-contain rounded-xl" />
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

    const currentQuestion = questions[currentStep];
    const currentAnswer = answers[currentQuestion.id] || "";

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
                        {currentQuestion.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`p-4 rounded-xl border-2 transition-all ${currentAnswer === option
                                    ? "border-violet-500 bg-violet-50 text-violet-900"
                                    : "border-slate-200 hover:border-violet-200 hover:bg-slate-50"
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
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:outline-none transition-all"
                        placeholder="Type your answer here..."
                    />
                )}
            </div>
        </AssessmentShell>
    );
}
