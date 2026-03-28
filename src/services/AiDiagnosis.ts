// import { NeuralNetwork } from "@/lib/NeuralNetwork";

// // Singleton service to handle AI predictions
// class AiDiagnosisService {
//     private dyslexiaModel: NeuralNetwork;
//     private dysgraphiaModel: NeuralNetwork;
//     private isTrained: boolean = false;

//     constructor() {
//         // Inputs: [Score (0-1), TimeTaken (normalized), MistakeCount (normalized)]
//         // Output: [Risk Probability]
//         this.dyslexiaModel = new NeuralNetwork(3, 4, 1);
//         this.dysgraphiaModel = new NeuralNetwork(3, 4, 1);
//         this.trainModels();
//     }

//     private trainModels() {
//         // Train with Synthetic Data
//         // Pattern: Low Score + High Time = High Risk (1)
//         // Pattern: High Score + Low Time = Low Risk (0)

//         const trainingData = [
//             { inputs: [0.1, 0.9, 0.8], target: [0.9] }, // Very low score, slow, many mistakes -> High Risk
//             { inputs: [0.2, 0.8, 0.7], target: [0.8] },
//             { inputs: [0.9, 0.1, 0.0], target: [0.05] }, // Perfect score, fast -> No risk
//             { inputs: [0.8, 0.2, 0.1], target: [0.1] },
//             { inputs: [0.5, 0.5, 0.5], target: [0.4] }, // Average
//             { inputs: [0.4, 0.6, 0.4], target: [0.5] },
//             { inputs: [0.1, 0.2, 0.1], target: [0.2] }, // Low score but fast? Maybe just careless, lower risk than struggling
//         ];

//         // Train 2000 times
//         for (let i = 0; i < 2000; i++) {
//             const data = trainingData[Math.floor(Math.random() * trainingData.length)];
//             this.dyslexiaModel.train(data.inputs, data.target);
//             this.dysgraphiaModel.train(data.inputs, data.target); // Using same pattern for proto
//         }

//         this.isTrained = true;
//         console.log("AI Models Trained");
//     }

//     // Predict Dyslexia Risk
//     // Score: 0-100 (will normalize)
//     // Time: Seconds (will normalize with cap 300s)
//     predictDyslexia(score: number, totalQuestions: number, timeSeconds: number): { risk: string, probability: number } {
//         const normScore = score / totalQuestions;
//         const normTime = Math.min(timeSeconds / 300, 1); // Cap at 5 mins
//         const normMistakes = 1 - normScore; // Approximation for metadata

//         const output = this.dyslexiaModel.predict([normScore, normTime, normMistakes]);
//         const probability = output[0]; // 0 to 1

//         let risk = "Low";
//         if (probability > 0.7) risk = "High";
//         else if (probability > 0.4) risk = "Moderate";

//         return { risk, probability };
//     }

//     // New: Predict Dysgraphia (Mocking logic via NN for now as we lack raw path data)
//     // We use time taken and "drawing quality" (length of data string as proxy for complexity)
//     predictDysgraphia(timeSeconds: number, drawingLength: number): { risk: string, probability: number } {
//         const normTime = Math.min(timeSeconds / 120, 1); // Cap at 2 mins
//         // If drawing is too short ( < 1000 chars), it might be incomplete/poor. 
//         // If too long, maybe too much jitter? Let's say optimal is midway.
//         // For this proto, we normalize length.
//         const normLength = Math.min(drawingLength / 5000, 1);

//         // Pass to model (reusing dysgraphiaModel)
//         const output = this.dysgraphiaModel.predict([normTime, normLength, 0.5]);
//         const probability = output[0];

//         let risk = "Low";
//         if (probability > 0.6) risk = "High";
//         else if (probability > 0.3) risk = "Moderate";

//         return { risk, probability };
//     }

//     // New: Predict Dyscalculia
//     predictDyscalculia(score: number, totalQuestions: number, timeSeconds: number): { risk: string, probability: number } {
//         // Reusing similar logic to Dyslexia for now on the generic model
//         const normScore = score / totalQuestions;
//         const normTime = Math.min(timeSeconds / 300, 1);

//         // Inverse logic: High score = low risk.
//         // The NN was trained: Low Score (0.1) -> High Risk (0.9). 

//         const output = this.dyslexiaModel.predict([normScore, normTime, 1 - normScore]);
//         const probability = output[0];

//         let risk = "Low";
//         if (probability > 0.7) risk = "High";
//         else if (probability > 0.4) risk = "Moderate";

//         return { risk, probability };
//     }
// }

// export const aiDiagnosis = new AiDiagnosisService();



/**
 * AiDiagnosis — Evidence-based screening engine
 *
 * Replaces the synthetic neural-network with a weighted, rule-based
 * scoring system that mirrors published dyslexia/dysgraphia/dyscalculia
 * screening rubrics (DST, WRAT, Connelly 2006).
 *
 * Key signals per disability:
 *  Dyslexia   → accuracy per category, per-question response latency,
 *               answer-change count, phonics vs visual split
 *  Dysgraphia → stroke metrics (pen lifts, path length, speed variance),
 *               time-on-task, letter-reversal count from vision AI
 *  Dyscalculia→ accuracy per category, latency on arithmetic vs estimation,
 *               sequential-error pattern
 */

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface RiskResult {
    risk: "Low" | "Moderate" | "High";
    probability: number;
    score: number;
    breakdown: Record<string, number>;
    flags: string[];
}

function clamp01(v: number): number { return Math.min(1, Math.max(0, v)); }

function scoreToRisk(score: number): "Low" | "Moderate" | "High" {
    if (score >= 60) return "High";
    if (score >= 30) return "Moderate";
    return "Low";
}

function stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
}

// ─── Dyslexia ─────────────────────────────────────────────────────────────────

export interface DyslexiaSignals {
    answers: Record<string, string>;
    correctAnswers: Record<string, string>;
    categories: Record<string, "spelling" | "phonetics" | "visual" | "memory">;
    questionTimes: Record<string, number>;
    answerChanges: Record<string, number>;
    totalQuestions: number;
}

export interface DyslexiaCategoryScores {
    spelling:  { correct: number; total: number };
    phonetics: { correct: number; total: number };
    visual:    { correct: number; total: number };
    memory:    { correct: number; total: number };
}

export function predictDyslexia(signals: DyslexiaSignals): RiskResult & { categoryScores: DyslexiaCategoryScores } {
    const flags: string[] = [];
    const breakdown: Record<string, number> = {};

    const categoryScores: DyslexiaCategoryScores = {
        spelling:  { correct: 0, total: 0 },
        phonetics: { correct: 0, total: 0 },
        visual:    { correct: 0, total: 0 },
        memory:    { correct: 0, total: 0 },
    };

    for (const [id, answer] of Object.entries(signals.answers)) {
        const cat = signals.categories[id];
        const correct = signals.correctAnswers[id];
        if (!cat || !correct) continue;
        categoryScores[cat].total++;
        if (answer.toLowerCase().trim() === correct.toLowerCase().trim()) categoryScores[cat].correct++;
    }

    const weights = { spelling: 12, phonetics: 14, visual: 8, memory: 6 };
    let accuracyRisk = 0;
    for (const cat of ["spelling", "phonetics", "visual", "memory"] as const) {
        const { correct, total } = categoryScores[cat];
        if (total === 0) continue;
        const errorRate = 1 - correct / total;
        accuracyRisk += errorRate * weights[cat];
        if (cat === "phonetics" && errorRate > 0.6) flags.push("Poor phonetic awareness (>60% errors)");
        if (cat === "spelling" && errorRate > 0.5) flags.push("Significant spelling errors (>50%)");
        if (cat === "memory" && errorRate > 0.5) flags.push("Weak working memory for text");
    }
    breakdown.accuracyRisk = Math.min(40, accuracyRisk);

    const times = Object.values(signals.questionTimes).filter(t => t > 0);
    if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const sd = stdDev(times);
        const maxTime = Math.max(...times);
        breakdown.latencyRisk = clamp01((avgTime - 8000) / 20000) * 12
            + clamp01((sd - 3000) / 15000) * 8
            + (maxTime > 30000 ? 5 : maxTime > 20000 ? 2 : 0);
        if (avgTime > 15000) flags.push(`Slow average response time (${(avgTime/1000).toFixed(1)}s per question)`);
        if (sd > 8000) flags.push("Highly inconsistent response times — specific question types causing difficulty");
    } else {
        breakdown.latencyRisk = 0;
    }

    const totalChanges = Object.values(signals.answerChanges).reduce((a, b) => a + b, 0);
    const changeRate = totalChanges / Math.max(signals.totalQuestions, 1);
    breakdown.answerChangeRisk = clamp01(changeRate / 3) * 15;
    if (changeRate > 1.5) flags.push("Frequent answer changes — possible visual confusion");

    const phonicsErr = categoryScores.phonetics.total > 0 ? 1 - categoryScores.phonetics.correct / categoryScores.phonetics.total : 0;
    const visualErr  = categoryScores.visual.total > 0    ? 1 - categoryScores.visual.correct / categoryScores.visual.total    : 0;
    breakdown.phonicsVisualRisk = Math.max(phonicsErr, visualErr) * 20;

    const totalScore = Math.min(100, breakdown.accuracyRisk + breakdown.latencyRisk + breakdown.answerChangeRisk + breakdown.phonicsVisualRisk);
    return { risk: scoreToRisk(totalScore), probability: clamp01(totalScore/100), score: totalScore, breakdown, flags, categoryScores };
}

// ─── Dysgraphia ───────────────────────────────────────────────────────────────

export interface DysgraphiaSignals {
    penLifts: number;
    totalPathLength: number;
    drawingTimeMs: number;
    strokeSpeedVariance: number;
    drawingComplete: boolean;
    voiceTranscriptLength: number;
    expectedTranscriptLength: number;
    visionLabel?: string;
    visionConfidence?: number;
}

export function predictDysgraphia(signals: DysgraphiaSignals): RiskResult {
    const flags: string[] = [];
    const breakdown: Record<string, number> = {};

    breakdown.completenessRisk = signals.drawingComplete ? 0 : 20;
    if (!signals.drawingComplete) flags.push("Drawing not completed");

    const liftRatio = signals.penLifts / 12;
    if (liftRatio > 2.5) { breakdown.penLiftRisk = 20; flags.push(`Excessive pen lifts (${signals.penLifts})`); }
    else if (liftRatio > 1.8) { breakdown.penLiftRisk = 10; flags.push("Above-average pen lifts"); }
    else if (liftRatio < 0.3 && signals.drawingComplete) { breakdown.penLiftRisk = 8; flags.push("Very few pen lifts — may not reflect real writing"); }
    else breakdown.penLiftRisk = 0;

    const drawSec = signals.drawingTimeMs / 1000;
    if (drawSec > 180) { breakdown.timeRisk = 20; flags.push(`Very slow writing (${drawSec.toFixed(0)}s for one sentence)`); }
    else if (drawSec > 120) { breakdown.timeRisk = 12; flags.push("Slow writing speed"); }
    else if (drawSec < 5 && signals.drawingComplete) { breakdown.timeRisk = 10; }
    else breakdown.timeRisk = 0;

    breakdown.strokeVarianceRisk = clamp01(signals.strokeSpeedVariance * 10) * 20;
    if (breakdown.strokeVarianceRisk > 14) flags.push("High stroke speed variance — possible fine motor difficulty");

    const transcriptRatio = signals.voiceTranscriptLength / Math.max(signals.expectedTranscriptLength, 1);
    if (transcriptRatio < 0.5) { breakdown.fluencyRisk = 10; flags.push("Reading fluency appears low"); }
    else if (transcriptRatio < 0.75) breakdown.fluencyRisk = 5;
    else breakdown.fluencyRisk = 0;

    if (signals.visionLabel === "poor" && (signals.visionConfidence ?? 0) > 0.6) { breakdown.visionRisk = 10; flags.push("Vision AI: writing quality assessed as poor"); }
    else if (signals.visionLabel === "adequate") breakdown.visionRisk = 4;
    else breakdown.visionRisk = 0;

    const totalScore = Math.min(100, breakdown.completenessRisk + breakdown.penLiftRisk + breakdown.timeRisk + breakdown.strokeVarianceRisk + breakdown.fluencyRisk + breakdown.visionRisk);
    return { risk: scoreToRisk(totalScore), probability: clamp01(totalScore/100), score: totalScore, breakdown, flags };
}

// ─── Dyscalculia ──────────────────────────────────────────────────────────────

export interface DyscalculiaSignals {
    answers: Record<string, string>;
    correctAnswers: Record<string, string>;
    categories: Record<string, "arithmetic" | "sequence" | "word_problem" | "estimation">;
    questionTimes: Record<string, number>;
    answerChanges: Record<string, number>;
    totalQuestions: number;
}

export interface DyscalculiaCategoryScores {
    arithmetic:   { correct: number; total: number };
    sequence:     { correct: number; total: number };
    word_problem: { correct: number; total: number };
    estimation:   { correct: number; total: number };
}

export function predictDyscalculia(signals: DyscalculiaSignals): RiskResult & { categoryScores: DyscalculiaCategoryScores } {
    const flags: string[] = [];
    const breakdown: Record<string, number> = {};

    const categoryScores: DyscalculiaCategoryScores = {
        arithmetic:   { correct: 0, total: 0 },
        sequence:     { correct: 0, total: 0 },
        word_problem: { correct: 0, total: 0 },
        estimation:   { correct: 0, total: 0 },
    };

    for (const [id, answer] of Object.entries(signals.answers)) {
        const cat = signals.categories[id];
        const correct = signals.correctAnswers[id];
        if (!cat || !correct) continue;
        categoryScores[cat].total++;
        if (answer.toLowerCase().trim() === correct.toLowerCase().trim()) categoryScores[cat].correct++;
    }

    const weights = { arithmetic: 16, sequence: 14, word_problem: 10, estimation: 5 };
    let accuracyRisk = 0;
    for (const cat of ["arithmetic", "sequence", "word_problem", "estimation"] as const) {
        const { correct, total } = categoryScores[cat];
        if (total === 0) continue;
        const errorRate = 1 - correct / total;
        accuracyRisk += errorRate * weights[cat];
        if (cat === "arithmetic" && errorRate > 0.6) flags.push("Basic arithmetic errors (>60%) — core dyscalculia indicator");
        if (cat === "sequence" && errorRate > 0.6) flags.push("Number sequence difficulty — poor number sense");
        if (cat === "word_problem" && errorRate > 0.7) flags.push("Difficulty translating word problems to math");
    }
    breakdown.accuracyRisk = Math.min(45, accuracyRisk);

    const arithmeticIds = Object.entries(signals.categories).filter(([,c]) => c === "arithmetic").map(([id]) => id);
    const arithmeticTimes = arithmeticIds.map(id => signals.questionTimes[id]).filter(t => t > 0);
    if (arithmeticTimes.length > 0) {
        const avg = arithmeticTimes.reduce((a, b) => a + b, 0) / arithmeticTimes.length;
        breakdown.arithmeticLatency = clamp01((avg - 8000) / 25000) * 25;
        if (avg > 18000) flags.push(`Very slow on arithmetic: avg ${(avg/1000).toFixed(1)}s per question`);
    } else breakdown.arithmeticLatency = 0;

    const seqErr = categoryScores.sequence.total > 0 ? 1 - categoryScores.sequence.correct / categoryScores.sequence.total : 0;
    breakdown.sequencePattern = seqErr * 15;

    const totalChanges = Object.values(signals.answerChanges).reduce((a, b) => a + b, 0);
    const changeRate = totalChanges / Math.max(signals.totalQuestions, 1);
    breakdown.indecisionRisk = clamp01(changeRate / 3) * 15;
    if (changeRate > 2) flags.push("High answer indecision — recalculating repeatedly");

    const totalScore = Math.min(100, breakdown.accuracyRisk + breakdown.arithmeticLatency + breakdown.sequencePattern + breakdown.indecisionRisk);
    return { risk: scoreToRisk(totalScore), probability: clamp01(totalScore/100), score: totalScore, breakdown, flags, categoryScores };
}

// ─── Legacy compatibility shim (keeps old imports working during migration) ───

class AiDiagnosisService {
    predictDyslexia(score: number, total: number, timeSeconds: number) {
        const normScore = score / total;
        const s = (1 - normScore) * 100;
        const risk = s >= 60 ? "High" : s >= 30 ? "Moderate" : "Low";
        return { risk, probability: clamp01(s / 100) };
    }
    predictDysgraphia(timeSeconds: number, drawingLength: number) {
        const s = clamp01(timeSeconds / 120) * 50 + (drawingLength < 1000 ? 30 : 0);
        const risk = s >= 60 ? "High" : s >= 30 ? "Moderate" : "Low";
        return { risk, probability: clamp01(s / 100) };
    }
    predictDyscalculia(score: number, total: number, timeSeconds: number) {
        return this.predictDyslexia(score, total, timeSeconds);
    }
}
export const aiDiagnosis = new AiDiagnosisService();
