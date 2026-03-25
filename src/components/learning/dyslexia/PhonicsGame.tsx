// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { ModuleShell } from "../ModuleShell";
// import { Button } from "@/components/ui/Button";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface WordChallenge {
//     id: string;
//     word: string;
//     image: string;       // emoji
//     hint: string;        // short kid-friendly hint from Gemini
//     scrambled: string[];
// }

// // ─── Accessibility styles ─────────────────────────────────────────────────────
// const STYLES = `
//   @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Nunito:wght@700;800;900&display=swap');
//   .phon-root * { box-sizing: border-box; }
//   .phon-root { font-family: 'Atkinson Hyperlegible', sans-serif; }
//   .phon-display { font-family: 'Nunito', sans-serif; }

//   @keyframes popIn {
//     0%   { opacity:0; transform: scale(.5) rotate(-8deg); }
//     70%  { transform: scale(1.12) rotate(2deg); }
//     100% { opacity:1; transform: scale(1) rotate(0deg); }
//   }
//   @keyframes wobble {
//     0%,100% { transform: rotate(0deg); }
//     20%     { transform: rotate(-8deg); }
//     40%     { transform: rotate(8deg); }
//     60%     { transform: rotate(-5deg); }
//     80%     { transform: rotate(4deg); }
//   }
//   @keyframes correctPulse {
//     0%   { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
//     70%  { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
//     100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
//   }
//   @keyframes wrongShake {
//     0%,100% { transform: translateX(0); }
//     20%     { transform: translateX(-8px); }
//     40%     { transform: translateX(8px); }
//     60%     { transform: translateX(-5px); }
//     80%     { transform: translateX(5px); }
//   }
//   @keyframes shimmer {
//     0%   { transform: translateX(-100%); }
//     100% { transform: translateX(200%); }
//   }
//   @keyframes float {
//     0%,100% { transform: translateY(0px); }
//     50%     { transform: translateY(-10px); }
//   }
//   @keyframes confettiFall {
//     0%   { opacity:1; transform: translateY(-20px) rotate(0deg); }
//     100% { opacity:0; transform: translateY(200px) rotate(720deg); }
//   }
//   .pop-in    { animation: popIn .45s cubic-bezier(.34,1.56,.64,1) both; }
//   .wobble    { animation: wobble .6s ease; }
//   .float     { animation: float 3s ease-in-out infinite; }
//   .shimmer-bar::after {
//     content:''; position:absolute; inset:0; border-radius:999px;
//     background: linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
//     animation: shimmer 2s infinite;
//   }
//   .correct-ring { animation: correctPulse .6s ease; }
//   .wrong-shake  { animation: wrongShake .5s ease; }
//   :focus-visible { outline: 4px solid #f59e0b; outline-offset: 3px; border-radius: 10px; }
// `;

// // ─── ⚠️  FRONTEND TESTING ONLY — move this to .env / server route before prod ──
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // 🔑 paste your key here

// // ─── Gemini fetch ──────────────────────────────────────────────────────────────
// async function fetchChallengesFromGemini(
//     difficulty: "easy" | "medium" | "hard",
//     count: number = 5
// ): Promise<WordChallenge[]> {
//     const difficultyMap = {
//         easy:   "2-3 letter simple English words suitable for kindergarten (e.g. CAT, DOG, SUN)",
//         medium: "4-5 letter common English words suitable for grade 1-2 (e.g. FROG, PLANT, SMILE)",
//         hard:   "5-7 letter English words suitable for grade 3-4 (e.g. FLOWER, GARDEN, BRIDGE)",
//     };

//     const prompt = `
// You are generating a phonics spelling game for children with dyslexia (ages 5-10).
// Generate ${count} unique word challenges at difficulty: ${difficultyMap[difficulty]}.

// Rules:
// - Each word must be spelled clearly and correctly (uppercase)
// - Pick a single emoji that clearly represents the word
// - Write a very short, encouraging hint (max 6 words) that helps the child guess the word from the emoji
// - Scramble the letters randomly (not just reversed)
// - Return ONLY valid JSON, no markdown, no explanation

// Format:
// [
//   {
//     "id": "1",
//     "word": "CAT",
//     "image": "🐱",
//     "hint": "A fluffy pet that meows",
//     "scrambled": ["A","T","C"]
//   }
// ]
// `;

//     const res = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
//         {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 contents: [{ parts: [{ text: prompt }] }],
//                 generationConfig: { temperature: 0.9, maxOutputTokens: 1200 },
//             }),
//         }
//     );

//     if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
//     const data = await res.json();
//     const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
//     // Strip possible markdown fences
//     const cleaned = raw.replace(/```json|```/g, "").trim();
//     return JSON.parse(cleaned) as WordChallenge[];
// }

// // ─── Confetti particle ────────────────────────────────────────────────────────
// function Confetti() {
//     const pieces = Array.from({ length: 18 }, (_, i) => ({
//         id: i,
//         color: ["#f59e0b","#6c3fc5","#22c55e","#ec4899","#3b82f6"][i % 5],
//         left: `${Math.random() * 100}%`,
//         delay: `${Math.random() * 0.5}s`,
//         size: 8 + Math.random() * 10,
//     }));
//     return (
//         <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:100 }}>
//             {pieces.map(p => (
//                 <div key={p.id} style={{
//                     position:"absolute", top:0, left:p.left,
//                     width:p.size, height:p.size, borderRadius:2,
//                     background:p.color,
//                     animation:`confettiFall 1.8s ${p.delay} ease-out forwards`,
//                 }} />
//             ))}
//         </div>
//     );
// }

// // ─── Main Component ────────────────────────────────────────────────────────────
// export function PhonicsGame() {
//     const { addXp, loseHeart, user } = useAuth();
//     const router = useRouter();

//     const [difficulty] = useState<"easy"|"medium"|"hard">("easy");
//     const [challenges, setChallenges] = useState<WordChallenge[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [loadError, setLoadError] = useState("");

//     const [currentStep, setCurrentStep] = useState(0);
//     const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
//     const [availableLetters, setAvailableLetters] = useState<string[]>([]);
//     const [feedback, setFeedback] = useState<"correct"|"wrong"|null>(null);
//     const [isComplete, setIsComplete] = useState(false);
//     const [showConfetti, setShowConfetti] = useState(false);
//     const [wrongCount, setWrongCount] = useState(0);

//     // Load challenges from Gemini on mount
//     useEffect(() => {
//         setLoading(true);
//         fetchChallengesFromGemini(difficulty, 5)
//             .then(data => {
//                 setChallenges(data);
//                 setAvailableLetters([...data[0].scrambled]);
//                 setLoading(false);
//             })
//             .catch(err => {
//                 console.error(err);
//                 setLoadError("Couldn't load challenges. Check your Gemini API key.");
//                 setLoading(false);
//             });
//     }, [difficulty]);

//     const handleSelectLetter = (letter: string, index: number) => {
//         if (feedback) return;
//         setSelectedLetters(prev => [...prev, letter]);
//         setAvailableLetters(prev => { const n=[...prev]; n.splice(index,1); return n; });
//     };

//     const handleRemoveLetter = (letter: string, index: number) => {
//         if (feedback) return;
//         setAvailableLetters(prev => [...prev, letter]);
//         setSelectedLetters(prev => { const n=[...prev]; n.splice(index,1); return n; });
//     };

//     const checkAnswer = useCallback(() => {
//         if (!challenges.length) return;
//         const challenge = challenges[currentStep];
//         const formed = selectedLetters.join("");

//         if (formed === challenge.word) {
//             setFeedback("correct");
//             setShowConfetti(true);
//             setTimeout(() => setShowConfetti(false), 1800);
//             setTimeout(() => {
//                 const next = currentStep + 1;
//                 if (next < challenges.length) {
//                     setCurrentStep(next);
//                     setSelectedLetters([]);
//                     setAvailableLetters([...challenges[next].scrambled]);
//                     setFeedback(null);
//                     setWrongCount(0);
//                 } else {
//                     setIsComplete(true);
//                     addXp(50);
//                 }
//             }, 1000);
//         } else {
//             setFeedback("wrong");
//             setWrongCount(c => c + 1);
//             loseHeart();
//             setTimeout(() => {
//                 setFeedback(null);
//                 // Auto-clear wrong answer so child can retry
//                 setSelectedLetters([]);
//                 setAvailableLetters([...challenges[currentStep].scrambled]);
//             }, 900);
//         }
//     }, [challenges, currentStep, selectedLetters, addXp, loseHeart]);

//     // ── Loading state ────────────────────────────────────────────────────────
//     if (loading) {
//         return (
//             <div className="phon-root" style={{
//                 minHeight:"100vh", display:"flex", flexDirection:"column",
//                 alignItems:"center", justifyContent:"center",
//                 background:"linear-gradient(135deg,#1e1040,#2d1a5e)",
//                 color:"#fff", gap:24, padding:32,
//             }}>
//                 <style>{STYLES}</style>
//                 <div className="float" style={{ fontSize:72 }}>🧠</div>
//                 <p className="phon-display" style={{ fontSize:22, fontWeight:800, textAlign:"center" }}>
//                     AI is creating your challenges…
//                 </p>
//                 <div style={{ width:220, height:12, borderRadius:999, background:"rgba(255,255,255,.2)", overflow:"hidden", position:"relative" }}>
//                     <div className="shimmer-bar" style={{
//                         position:"relative", overflow:"hidden",
//                         height:"100%", borderRadius:999,
//                         background:"linear-gradient(90deg,#f59e0b,#a855f7)",
//                         animation:"shimmerBar 1.5s infinite",
//                         width:"70%",
//                     }} />
//                 </div>
//                 <p style={{ color:"rgba(255,255,255,.55)", fontSize:14 }}>Powered by Gemini ✨</p>
//             </div>
//         );
//     }

//     // ── Error state ──────────────────────────────────────────────────────────
//     if (loadError) {
//         return (
//             <div className="phon-root" style={{
//                 minHeight:"100vh", display:"flex", flexDirection:"column",
//                 alignItems:"center", justifyContent:"center",
//                 background:"#1e1040", color:"#fff", gap:20, padding:32, textAlign:"center"
//             }}>
//                 <style>{STYLES}</style>
//                 <div style={{ fontSize:64 }}>😕</div>
//                 <p className="phon-display" style={{ fontSize:20, fontWeight:800 }}>{loadError}</p>
//                 <button
//                     onClick={() => { setLoadError(""); setLoading(true); fetchChallengesFromGemini(difficulty).then(d => { setChallenges(d); setAvailableLetters([...d[0].scrambled]); setLoading(false); }).catch(() => setLoadError("Still failing. Check your API key.")); }}
//                     style={{ padding:"14px 36px", borderRadius:999, background:"#f59e0b", color:"#1e1040", fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:18, border:"none", cursor:"pointer" }}
//                 >
//                     Try Again
//                 </button>
//             </div>
//         );
//     }

//     // ── Complete state ───────────────────────────────────────────────────────
//     if (isComplete) {
//         return (
//             <div className="phon-root" style={{
//                 minHeight:"100vh", display:"flex", flexDirection:"column",
//                 alignItems:"center", justifyContent:"center",
//                 background:"linear-gradient(135deg,#6c3fc5,#f59e0b)",
//                 color:"#fff", padding:32, textAlign:"center", gap:16,
//             }}>
//                 <style>{STYLES}</style>
//                 <Confetti />
//                 <motion.div
//                     initial={{ scale:0 }} animate={{ scale:1 }}
//                     transition={{ type:"spring", stiffness:200, damping:10 }}
//                     style={{ fontSize:88 }}
//                 >🎉</motion.div>
//                 <h1 className="phon-display" style={{ fontSize:40, fontWeight:900, margin:0 }}>You did it!</h1>
//                 <p style={{ fontSize:20, opacity:.9, marginBottom:8 }}>+50 XP Earned 🌟</p>
//                 <div style={{
//                     background:"rgba(255,255,255,.2)", borderRadius:20, padding:"14px 28px",
//                     fontSize:16, marginBottom:16,
//                 }}>
//                     {wrongCount === 0 ? "Perfect score! Amazing! 🏆" : `${5 - wrongCount}/5 correct first try 👏`}
//                 </div>
//                 <button
//                     onClick={() => router.push("/dashboard")}
//                     style={{
//                         background:"#fff", color:"#6c3fc5",
//                         fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:20,
//                         padding:"16px 48px", borderRadius:999, border:"none",
//                         cursor:"pointer", boxShadow:"0 8px 0 rgba(0,0,0,.2)",
//                         transition:"transform .15s",
//                     }}
//                     onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
//                     onMouseLeave={e=>e.currentTarget.style.transform=""}
//                 >
//                     Continue Journey 🚀
//                 </button>
//             </div>
//         );
//     }

//     const challenge = challenges[currentStep];
//     const progress = ((currentStep) / challenges.length) * 100;
//     const canCheck = selectedLetters.length === challenge.word.length && !feedback;

//     return (
//         <div className="phon-root" style={{ minHeight:"100vh", background:"#f5f0ff" }}>
//             <style>{STYLES}</style>
//             {showConfetti && <Confetti />}

//             <ModuleShell
//                 title="Phonics Adventure"
//                 totalSteps={challenges.length}
//                 currentStep={currentStep}
//                 onExit={() => router.push("/dashboard")}
//             >
//                 {/* ── Progress bar ── */}
//                 <div style={{ width:"100%", maxWidth:480, margin:"0 auto 28px", padding:"0 4px" }}>
//                     <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
//                         <span className="phon-display" style={{ fontSize:13, fontWeight:800, color:"#6c3fc5" }}>
//                             Word {currentStep + 1} of {challenges.length}
//                         </span>
//                         <span style={{ fontSize:13, color:"#9d6ef8", fontWeight:700 }}>
//                             {Math.round(progress)}% done
//                         </span>
//                     </div>
//                     <div style={{ height:12, background:"#ede6ff", borderRadius:999, overflow:"hidden", position:"relative" }}>
//                         <motion.div
//                             animate={{ width:`${progress + 20}%` }}
//                             transition={{ duration:.6, ease:"easeOut" }}
//                             style={{
//                                 position:"relative", overflow:"hidden",
//                                 height:"100%", borderRadius:999,
//                                 background:"linear-gradient(90deg,#6c3fc5,#a855f7)",
//                             }}
//                         >
//                             <div className="shimmer-bar" style={{ position:"absolute", inset:0, borderRadius:999 }} />
//                         </motion.div>
//                     </div>
//                 </div>

//                 <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:480, margin:"0 auto", gap:0 }}>

//                     {/* ── Emoji + Hint ── */}
//                     <AnimatePresence mode="wait">
//                         <motion.div
//                             key={challenge.id}
//                             initial={{ opacity:0, y:24, scale:.8 }}
//                             animate={{ opacity:1, y:0, scale:1 }}
//                             exit={{ opacity:0, y:-24, scale:.8 }}
//                             transition={{ type:"spring", stiffness:220, damping:18 }}
//                             style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:28 }}
//                         >
//                             <div className="float" style={{ fontSize:96, lineHeight:1, filter:"drop-shadow(0 8px 16px rgba(108,63,197,.25))" }}
//                                 aria-label={challenge.hint}>
//                                 {challenge.image}
//                             </div>
//                             <div style={{
//                                 background:"#fff", border:"2px solid #ede6ff",
//                                 borderRadius:16, padding:"10px 22px",
//                                 fontFamily:"Atkinson Hyperlegible, sans-serif",
//                                 fontSize:17, color:"#4c3a7a",
//                                 letterSpacing:".04em", lineHeight:1.6,
//                                 boxShadow:"0 4px 16px rgba(108,63,197,.08)",
//                                 textAlign:"center",
//                             }}>
//                                 💡 {challenge.hint}
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>

//                     {/* ── Drop zone ── */}
//                     <motion.div
//                         animate={feedback === "wrong" ? { x: [0,-10,10,-8,8,-4,4,0] } : {}}
//                         transition={{ duration:.5 }}
//                         style={{
//                             display:"flex", gap:8, marginBottom:20,
//                             minHeight:80, padding:"12px 20px",
//                             background: feedback === "correct" ? "#dcfce7"
//                                       : feedback === "wrong"   ? "#fee2e2"
//                                       : "#fff",
//                             borderRadius:20,
//                             border: feedback === "correct" ? "3px solid #22c55e"
//                                   : feedback === "wrong"   ? "3px solid #ef4444"
//                                   : "3px dashed #c4b5f7",
//                             width:"100%", justifyContent:"center", alignItems:"center",
//                             transition:"background .25s, border-color .25s",
//                             boxShadow: feedback === "correct" ? "0 0 0 6px rgba(34,197,94,.15)"
//                                      : feedback === "wrong"   ? "0 0 0 6px rgba(239,68,68,.15)"
//                                      : "0 4px 20px rgba(108,63,197,.08)",
//                         }}
//                         aria-label="Your answer goes here"
//                         aria-live="polite"
//                     >
//                         {selectedLetters.length === 0 ? (
//                             <span style={{ color:"#c4b5f7", fontSize:16, fontFamily:"Atkinson Hyperlegible,sans-serif", letterSpacing:".06em" }}>
//                                 Tap letters to build the word
//                             </span>
//                         ) : (
//                             selectedLetters.map((l, i) => (
//                                 <motion.button
//                                     key={`sel-${i}`}
//                                     layout
//                                     initial={{ scale:0, opacity:0 }}
//                                     animate={{ scale:1, opacity:1 }}
//                                     exit={{ scale:0 }}
//                                     onClick={() => handleRemoveLetter(l, i)}
//                                     aria-label={`Remove letter ${l}`}
//                                     style={{
//                                         width:60, height:60, borderRadius:14,
//                                         background: feedback === "correct" ? "#bbf7d0"
//                                                   : feedback === "wrong"   ? "#fecaca"
//                                                   : "#f0ebff",
//                                         border: feedback === "correct" ? "3px solid #22c55e"
//                                               : feedback === "wrong"   ? "3px solid #ef4444"
//                                               : "3px solid #c4b5f7",
//                                         borderBottom: feedback === "correct" ? "5px solid #16a34a"
//                                                     : feedback === "wrong"   ? "5px solid #dc2626"
//                                                     : "5px solid #a78bfa",
//                                         fontFamily:"Nunito,sans-serif", fontWeight:900,
//                                         fontSize:26, color: feedback === "correct" ? "#16a34a"
//                                                           : feedback === "wrong"   ? "#dc2626"
//                                                           : "#6c3fc5",
//                                         cursor: feedback ? "default" : "pointer",
//                                         display:"flex", alignItems:"center", justifyContent:"center",
//                                         transition:"background .2s, border-color .2s",
//                                         flexShrink:0,
//                                     }}
//                                 >
//                                     {l}
//                                 </motion.button>
//                             ))
//                         )}
//                     </motion.div>

//                     {/* ── Feedback label ── */}
//                     <AnimatePresence>
//                         {feedback && (
//                             <motion.p
//                                 initial={{ opacity:0, scale:.7 }}
//                                 animate={{ opacity:1, scale:1 }}
//                                 exit={{ opacity:0, scale:.7 }}
//                                 style={{
//                                     fontFamily:"Nunito,sans-serif", fontWeight:900,
//                                     fontSize:20, marginBottom:8,
//                                     color: feedback === "correct" ? "#16a34a" : "#dc2626",
//                                 }}
//                                 role="alert"
//                             >
//                                 {feedback === "correct" ? "🎉 Awesome! Correct!" : "❌ Not quite — try again!"}
//                             </motion.p>
//                         )}
//                     </AnimatePresence>

//                     {/* ── Wrong-answer hint (after 2 tries) ── */}
//                     <AnimatePresence>
//                         {wrongCount >= 2 && !feedback && (
//                             <motion.div
//                                 initial={{ opacity:0, y:8 }}
//                                 animate={{ opacity:1, y:0 }}
//                                 style={{
//                                     background:"#fef3c7", border:"2px solid #fde68a",
//                                     borderRadius:14, padding:"10px 18px",
//                                     fontSize:15, color:"#92400e", marginBottom:10,
//                                     textAlign:"center", letterSpacing:".04em",
//                                 }}
//                                 role="alert"
//                             >
//                                 🌟 Hint: The word has <strong>{challenge.word.length}</strong> letters —
//                                 starts with <strong>{challenge.word[0]}</strong>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>

//                     {/* ── Letter bank ── */}
//                     <div
//                         style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:24, marginTop:4 }}
//                         aria-label="Available letters"
//                         role="group"
//                     >
//                         <AnimatePresence>
//                             {availableLetters.map((l, i) => (
//                                 <motion.button
//                                     key={`bank-${i}-${l}`}
//                                     layout
//                                     initial={{ scale:0, opacity:0 }}
//                                     animate={{ scale:1, opacity:1 }}
//                                     exit={{ scale:0, opacity:0 }}
//                                     transition={{ type:"spring", stiffness:260, damping:18 }}
//                                     onClick={() => handleSelectLetter(l, i)}
//                                     aria-label={`Select letter ${l}`}
//                                     disabled={!!feedback}
//                                     style={{
//                                         width:68, height:68, borderRadius:18,
//                                         background: feedback ? "#e5e7eb" : "#fff",
//                                         border:"3px solid #c4b5f7",
//                                         borderBottom:"6px solid #a78bfa",
//                                         fontFamily:"Nunito,sans-serif", fontWeight:900,
//                                         fontSize:28, color: feedback ? "#9ca3af" : "#6c3fc5",
//                                         cursor: feedback ? "not-allowed" : "pointer",
//                                         display:"flex", alignItems:"center", justifyContent:"center",
//                                         boxShadow:"0 4px 12px rgba(108,63,197,.12)",
//                                         transition:"transform .15s, box-shadow .15s",
//                                     }}
//                                     whileHover={!feedback ? { scale:1.1, y:-3 } : {}}
//                                     whileTap={!feedback ? { scale:.92, y:4, boxShadow:"0 1px 4px rgba(108,63,197,.1)" } : {}}
//                                 >
//                                     {l}
//                                 </motion.button>
//                             ))}
//                         </AnimatePresence>
//                     </div>

//                     {/* ── Check button ── */}
//                     <motion.button
//                         onClick={checkAnswer}
//                         disabled={!canCheck}
//                         aria-label="Check my answer"
//                         whileHover={canCheck ? { scale:1.03 } : {}}
//                         whileTap={canCheck ? { scale:.97 } : {}}
//                         style={{
//                             width:"100%", padding:"18px 0", borderRadius:20,
//                             fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:20,
//                             border:"none",
//                             borderBottom: canCheck ? "6px solid #4c1d95" : "6px solid #d1d5db",
//                             background: canCheck
//                                 ? "linear-gradient(135deg,#6c3fc5,#a855f7)"
//                                 : "#e5e7eb",
//                             color: canCheck ? "#fff" : "#9ca3af",
//                             cursor: canCheck ? "pointer" : "not-allowed",
//                             boxShadow: canCheck ? "0 8px 24px rgba(108,63,197,.3)" : "none",
//                             transition:"background .2s, box-shadow .2s, color .2s",
//                             letterSpacing:".04em",
//                         }}
//                     >
//                         {canCheck ? "✅ Check Answer" : `Fill all ${challenge.word.length} letters`}
//                     </motion.button>

//                 </div>
//             </ModuleShell>
//         </div>
//     );
// }

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ModuleShell } from "../ModuleShell";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WordChallenge {
    id: string;
    word: string;
    image: string;
    hint: string;
    scrambled: string[];
}

interface LetterTile {
    letter: string;
    uid: string; // stable unique id even for duplicate letters (e.g. BOOK)
}

// ─── ⚠️  FRONTEND TESTING ONLY ───────────────────────────────────────────────
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// console.log(GEMINI_API_KEY)

// ─── Fisher-Yates shuffle ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Guarantee the scrambled order is NEVER identical to the original word
function trulyScramble(letters: string[]): string[] {
    if (letters.length <= 1) return letters;
    let result = shuffle(letters);
    let tries = 0;
    while (result.join("") === letters.join("") && tries++ < 30) {
        result = shuffle(letters);
    }
    return result;
}

// Give each tile a unique uid so React keys survive duplicate letters
function toTiles(letters: string[]): LetterTile[] {
    return letters.map((letter, i) => ({
        letter,
        uid: `${letter}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    }));
}

// ─── Gemini fetch ─────────────────────────────────────────────────────────────
// FIX A: temperature=1.0 + random theme + random seed → different words EVERY time
async function fetchChallengesFromGemini(
    difficulty: "easy" | "medium" | "hard",
    count = 5
): Promise<WordChallenge[]> {
    const diffMap = {
        easy:   "2–3 letter very simple English words for kindergarten (e.g. CAT, DOG, SUN, CUP, HAT, PIG, BUS)",
        medium: "4–5 letter common English words for grade 1–2 (e.g. FROG, CLOUD, SMILE, PLANT, BREAD)",
        hard:   "5–7 letter English words for grade 3–4 (e.g. BRIDGE, FLOWER, CARPET, ROCKET, PLANET)",
    };

    const themes = [
        "animals", "food", "nature", "sports", "clothes",
        "vehicles", "kitchen", "playground", "weather", "body parts",
        "farm", "ocean", "space", "music", "garden", "school",
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const seed  = Math.random().toString(36).slice(2, 9); // forces cache-busting

    const prompt = `
Unique session seed (ignore, just ensures a fresh response): ${seed}
Theme for this round: "${theme}"

You are making a phonics spelling game for children (ages 5–10) with dyslexia.
Generate EXACTLY ${count} UNIQUE English words related to "${theme}".
Difficulty: ${diffMap[difficulty]}.

RULES:
1. All words UPPERCASE. Every word must be different from each other.
2. "scrambled" MUST be in a RANDOM order — never the same order as the word.
   Example: word "CAT" → scrambled ["T","C","A"] NOT ["C","A","T"].
3. One clear, simple emoji a child instantly recognises.
4. hint = max 7 words, friendly, fun.
5. Return ONLY compact valid JSON — no markdown, no code fences, no explanation.

[{"id":"1","word":"HAT","image":"🎩","hint":"You wear it on your head!","scrambled":["T","H","A"]}]
`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 1.0, topP: 0.97, maxOutputTokens: 1200 },
            }),
        }
    );
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data    = await res.json();
    const raw     = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed: WordChallenge[] = JSON.parse(cleaned);

    // FIX B: always re-scramble client-side so we never show word order
    return parsed.map(c => ({ ...c, scrambled: trulyScramble(c.word.split("")) }));
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
    const pieces = useRef(
        Array.from({ length: 28 }, (_, i) => ({
            id: i,
            color: ["#F59E0B","#6366F1","#22C55E","#EC4899","#3B82F6","#F97316","#A855F7"][i % 7],
            left: `${3 + Math.random() * 94}%`,
            delay: `${Math.random() * 0.7}s`,
            size: 8 + Math.random() * 14,
            shape: i % 3 === 0 ? "50%" : "3px",
        }))
    );
    return (
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:300, overflow:"hidden" }}>
            {pieces.current.map(p => (
                <div key={p.id} style={{
                    position:"absolute", top:-20, left:p.left,
                    width:p.size, height:p.size,
                    borderRadius:p.shape, background:p.color,
                    animation:`pgConfetti 2.2s ${p.delay} ease-out forwards`,
                }} />
            ))}
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Nunito:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes pgFloat    { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-14px) scale(1.05);} }
  @keyframes pgConfetti { 0%{opacity:1;transform:translateY(0) rotate(0deg) scale(1);} 85%{opacity:.9;} 100%{opacity:0;transform:translateY(340px) rotate(580deg) scale(.35);} }
  @keyframes pgSlideUp  { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pgShimmer  { from{transform:translateX(-150%);} to{transform:translateX(150%);} }
  @keyframes pgBounce   { 0%{transform:scale(1);} 35%{transform:scale(1.22);} 65%{transform:scale(.9);} 100%{transform:scale(1);} }
  @keyframes pgWiggle   { 0%,100%{transform:translateX(0) rotate(0);} 18%{transform:translateX(-13px) rotate(-4deg);} 36%{transform:translateX(13px) rotate(4deg);} 54%{transform:translateX(-8px);} 72%{transform:translateX(8px);} }
  @keyframes pgHintPop  { 0%{opacity:0;transform:scale(.78);} 100%{opacity:1;transform:scale(1);} }

  .pg-float      { animation: pgFloat 3.4s ease-in-out infinite; }
  .pg-slide-up   { animation: pgSlideUp .4s ease both; }
  .pg-hint-pop   { animation: pgHintPop .38s cubic-bezier(.34,1.56,.64,1) both; }

  /* Focus ring – bright amber, highly visible */
  :focus-visible { outline: 4px solid #F59E0B; outline-offset: 4px; border-radius: 14px; }

  /* ── Letter tiles ── */
  .pg-tile {
    display: flex; align-items: center; justify-content: center;
    font-family: 'Nunito', sans-serif; font-weight: 900;
    border-radius: 20px; cursor: pointer; user-select: none; flex-shrink: 0;
    transition: transform .12s, box-shadow .12s;
    -webkit-tap-highlight-color: transparent;
    width: 82px; height: 82px; font-size: 36px;
  }
  .pg-tile:active { transform: scale(.88) translateY(6px) !important; }

  /* Bank tile — white with indigo border */
  .pg-bank {
    background: #ffffff; color: #3730A3;
    border: 3px solid #C7D2FE; border-bottom: 7px solid #6366F1;
    box-shadow: 0 6px 20px rgba(99,102,241,.18);
  }
  .pg-bank:not(:disabled):hover {
    transform: scale(1.13) translateY(-6px);
    box-shadow: 0 16px 30px rgba(99,102,241,.32);
  }

  /* Placed tile — soft indigo fill */
  .pg-placed {
    background: #EEF2FF; color: #312E81;
    border: 3px solid #818CF8; border-bottom: 7px solid #4F46E5;
    box-shadow: 0 4px 14px rgba(79,70,229,.15);
  }
  .pg-placed:not(:disabled):hover { transform: scale(1.07) translateY(-3px); }

  /* Correct */
  .pg-correct {
    background: #DCFCE7; color: #14532D;
    border: 3px solid #4ADE80; border-bottom: 7px solid #16A34A;
    animation: pgBounce .55s ease;
  }
  /* Wrong */
  .pg-wrong {
    background: #FEE2E2; color: #991B1B;
    border: 3px solid #FCA5A5; border-bottom: 7px solid #DC2626;
    animation: pgWiggle .55s ease;
  }
  /* Disabled */
  .pg-disabled {
    background: #F3F4F6; color: #9CA3AF;
    border: 3px solid #E5E7EB; border-bottom: 7px solid #D1D5DB;
    cursor: not-allowed; opacity: .65;
  }

  /* ── Drop zone ── */
  .pg-dz {
    display: flex; flex-wrap: wrap; gap: 10px;
    min-height: 108px; padding: 14px 18px;
    border-radius: 30px; width: 100%;
    justify-content: center; align-items: center;
    transition: all .25s;
  }
  .pg-dz-empty   { background: #F5F3FF; border: 3px dashed #C4B5FD; }
  .pg-dz-filled  { background: #EEF2FF; border: 3px solid #818CF8; box-shadow: 0 4px 20px rgba(99,102,241,.1); }
  .pg-dz-correct { background: #F0FDF4; border: 3px solid #4ADE80; box-shadow: 0 0 0 7px rgba(74,222,128,.18); }
  .pg-dz-wrong   { background: #FFF1F2; border: 3px solid #FCA5A5; box-shadow: 0 0 0 7px rgba(252,165,165,.18); animation: pgWiggle .55s ease; }

  /* ── Check button ── */
  .pg-chk {
    width: 100%; padding: 22px 0; border: none; border-radius: 26px;
    font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 22px;
    letter-spacing: .04em; cursor: pointer;
    transition: transform .12s, box-shadow .12s, background .2s;
  }
  .pg-chk-on {
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    color: #fff; border-bottom: 8px solid #312E81;
    box-shadow: 0 10px 32px rgba(79,70,229,.38);
  }
  .pg-chk-on:hover  { transform: scale(1.025) translateY(-2px); }
  .pg-chk-on:active { transform: scale(.96) translateY(7px); box-shadow: 0 3px 10px rgba(79,70,229,.2); }
  .pg-chk-off { background: #E5E7EB; color: #9CA3AF; border-bottom: 8px solid #D1D5DB; cursor: not-allowed; }
  .pg-chk-ok  { background: linear-gradient(135deg,#22C55E,#16A34A); color:#fff; border-bottom:8px solid #15803D; }
  .pg-chk-no  { background: linear-gradient(135deg,#EF4444,#DC2626); color:#fff; border-bottom:8px solid #B91C1C; }

  /* ── Progress ── */
  .pg-prog-track { height: 18px; border-radius: 999px; background: #E0E7FF; overflow: hidden; position: relative; }
  .pg-prog-fill  { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#6366F1,#A855F7); position: relative; overflow: hidden; transition: width .75s cubic-bezier(.34,1.56,.64,1); }
  .pg-prog-fill::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent); animation: pgShimmer 2.2s infinite; }
`;

// ─── Component ─────────────────────────────────────────────────────────────────
export function PhonicsGame() {
    const { addXp, loseHeart } = useAuth();
    const router = useRouter();

    const [difficulty]               = useState<"easy"|"medium"|"hard">("easy");
    const [challenges, setChallenges]     = useState<WordChallenge[]>([]);
    const [loading, setLoading]           = useState(true);
    const [loadError, setLoadError]       = useState("");
    const [currentStep, setCurrentStep]   = useState(0);
    const [bankTiles, setBankTiles]       = useState<LetterTile[]>([]);
    const [placedTiles, setPlacedTiles]   = useState<LetterTile[]>([]);
    const [feedback, setFeedback]         = useState<"correct"|"wrong"|null>(null);
    const [isComplete, setIsComplete]     = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [wrongCount, setWrongCount]     = useState(0);

    // ── Load ──────────────────────────────────────────────────────────────────
    const load = useCallback(() => {
        setLoading(true); setLoadError("");
        fetchChallengesFromGemini(difficulty)
            .then(data => {
                setChallenges(data);
                setBankTiles(toTiles(data[0].scrambled));
                setPlacedTiles([]); setCurrentStep(0); setLoading(false);
            })
            .catch(e => { console.error(e); setLoadError("Couldn't load. Check your API key."); setLoading(false); });
    }, [difficulty]);

    useEffect(() => { load(); }, [load]);

    // ── Pick / unpick ─────────────────────────────────────────────────────────
    const pickLetter = (tile: LetterTile) => {
        if (feedback) return;
        setPlacedTiles(p => [...p, tile]);
        setBankTiles(b => { const n=[...b]; n.splice(n.findIndex(t=>t.uid===tile.uid),1); return n; });
    };
    const unpickLetter = (tile: LetterTile) => {
        if (feedback) return;
        setBankTiles(b => [...b, tile]);
        setPlacedTiles(p => { const n=[...p]; n.splice(n.findIndex(t=>t.uid===tile.uid),1); return n; });
    };

    // ── Check ─────────────────────────────────────────────────────────────────
    const checkAnswer = useCallback(() => {
        if (!challenges.length || feedback) return;
        const word   = challenges[currentStep].word;
        const formed = placedTiles.map(t=>t.letter).join("");

        if (formed === word) {
            setFeedback("correct"); setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2200);
            setTimeout(() => {
                const next = currentStep + 1;
                if (next < challenges.length) {
                    // FIX B: fresh client-side shuffle for every new word
                    setBankTiles(toTiles(trulyScramble(challenges[next].word.split(""))));
                    setPlacedTiles([]); setCurrentStep(next);
                    setFeedback(null); setWrongCount(0);
                } else { setIsComplete(true); addXp(50); }
            }, 1100);
        } else {
            setFeedback("wrong"); setWrongCount(c=>c+1); loseHeart();
            setTimeout(() => {
                setFeedback(null);
                // Re-shuffle on wrong so the layout changes (not the same order again)
                setBankTiles(toTiles(trulyScramble(challenges[currentStep].word.split(""))));
                setPlacedTiles([]);
            }, 950);
        }
    }, [challenges, currentStep, placedTiles, feedback, addXp, loseHeart]);

    const challenge  = challenges[currentStep];
    const canCheck   = !!challenge && placedTiles.length === challenge?.word.length && !feedback;
    const progress   = challenges.length ? (currentStep / challenges.length) * 100 : 0;

    // Tile class helper
    const tileStateClass = (state: "bank"|"placed") =>
        feedback === "correct" ? "pg-tile pg-correct" :
        feedback === "wrong"   ? "pg-tile pg-wrong"   :
        state === "bank"       ? "pg-tile pg-bank"     : "pg-tile pg-placed";

    // Drop-zone class
    const dzClass =
        feedback === "correct"   ? "pg-dz pg-dz-correct" :
        feedback === "wrong"     ? "pg-dz pg-dz-wrong"   :
        placedTiles.length > 0   ? "pg-dz pg-dz-filled"  : "pg-dz pg-dz-empty";

    // Check-btn class
    const chkClass =
        feedback === "correct" ? "pg-chk pg-chk-ok" :
        feedback === "wrong"   ? "pg-chk pg-chk-no" :
        canCheck               ? "pg-chk pg-chk-on" : "pg-chk pg-chk-off";

    // ── LOADING ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:32 }}>
            <style>{CSS}</style>
            <div className="pg-float" style={{ fontSize:96 }}>🧠</div>
            <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:26, color:"#4338CA", textAlign:"center" }}>
                AI is crafting your challenges…
            </p>
            <div style={{ width:280, height:18, borderRadius:999, background:"#E0E7FF", overflow:"hidden", position:"relative" }}>
                <div style={{ width:"60%", height:"100%", background:"linear-gradient(90deg,#6366F1,#A855F7)", position:"relative", overflow:"hidden", borderRadius:999 }}>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)", animation:"pgShimmer 1.8s infinite" }} />
                </div>
            </div>
            <p style={{ fontSize:15, color:"#818CF8", fontFamily:"Atkinson Hyperlegible,sans-serif" }}>Powered by Gemini ✨</p>
        </div>
    );

    // ── ERROR ─────────────────────────────────────────────────────────────────
    if (loadError) return (
        <div style={{ minHeight:"100vh", background:"#FFF8F0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:32, textAlign:"center" }}>
            <style>{CSS}</style>
            <div style={{ fontSize:80 }}>😕</div>
            <p style={{ fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:22, color:"#DC2626" }}>{loadError}</p>
            <button onClick={load} style={{ padding:"16px 44px", borderRadius:999, background:"#4F46E5", color:"#fff", fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:19, border:"none", cursor:"pointer", boxShadow:"0 6px 0 #312E81" }}>
                Try Again 🔄
            </button>
        </div>
    );

    // ── COMPLETE ──────────────────────────────────────────────────────────────
    if (isComplete) return (
        <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", gap:18 }}>
            <style>{CSS}</style>
            <Confetti />
            <motion.div initial={{scale:0,rotate:-15}} animate={{scale:1,rotate:0}} transition={{type:"spring",stiffness:180,damping:10}} style={{fontSize:108}}>🎉</motion.div>
            <h1 style={{ fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:52, color:"#fff", margin:0 }}>You did it!</h1>
            <p style={{ fontSize:24, color:"rgba(255,255,255,.92)" }}>+50 XP Earned 🌟</p>
            <div style={{ background:"rgba(255,255,255,.22)", borderRadius:20, padding:"14px 30px", fontSize:19, color:"#fff", marginBottom:6 }}>
                {wrongCount === 0 ? "🏆 Perfect round! Zero mistakes!" : "👏 Great effort — keep practising!"}
            </div>
            <button
                onClick={() => router.push("/dashboard")}
                style={{ background:"#fff", color:"#4F46E5", fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:22, padding:"18px 56px", borderRadius:999, border:"none", cursor:"pointer", boxShadow:"0 8px 0 rgba(0,0,0,.18)", transition:"transform .13s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}
            >
                Continue Journey 🚀
            </button>
        </div>
    );

    // ── GAME ──────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight:"100vh", background:"#FFF8F0", fontFamily:"Atkinson Hyperlegible,sans-serif" }}>
            <style>{CSS}</style>
            {showConfetti && <Confetti />}

            <ModuleShell title="Phonics Adventure" totalSteps={challenges.length} currentStep={currentStep} onExit={() => router.push("/dashboard")}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:540, margin:"0 auto", padding:"0 4px", gap:0 }}>

                    {/* ── Progress bar + step dots ── */}
                    <div className="pg-slide-up" style={{ width:"100%", marginBottom:28 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <span style={{ fontFamily:"Nunito,sans-serif", fontWeight:800, fontSize:17, color:"#4338CA" }}>
                                Word {currentStep+1} of {challenges.length}
                            </span>
                            <div style={{ display:"flex", gap:6 }}>
                                {challenges.map((_,i) => (
                                    <div key={i} style={{
                                        height:12, borderRadius:999,
                                        width: i === currentStep ? 22 : 12,
                                        background: i < currentStep ? "#6366F1" : i === currentStep ? "#4F46E5" : "#C7D2FE",
                                        transition:"all .4s",
                                    }} />
                                ))}
                            </div>
                        </div>
                        <div className="pg-prog-track">
                            <div className="pg-prog-fill" style={{ width:`${Math.max(progress + 20, 12)}%` }} />
                        </div>
                    </div>

                    {/* ── Emoji + Hint ── */}
                    <AnimatePresence mode="wait">
                        <motion.div key={challenge.id}
                            initial={{ opacity:0, scale:.7, y:24 }}
                            animate={{ opacity:1, scale:1, y:0 }}
                            exit={{ opacity:0, scale:.7, y:-24 }}
                            transition={{ type:"spring", stiffness:220, damping:16 }}
                            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginBottom:24 }}>

                            <div className="pg-float" style={{ fontSize:112, lineHeight:1, filter:"drop-shadow(0 10px 24px rgba(99,102,241,.22))" }} role="img" aria-label={challenge.hint}>
                                {challenge.image}
                            </div>

                            <div className="pg-hint-pop" style={{
                                background:"#FFFBEB", border:"3px solid #FDE68A", borderRadius:22,
                                padding:"13px 28px", fontSize:20, color:"#92400E", fontWeight:700,
                                letterSpacing:".04em", lineHeight:1.55, textAlign:"center",
                                boxShadow:"0 4px 18px rgba(245,158,11,.16)",
                            }}>
                                💡 {challenge.hint}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Answer drop zone ── */}
                    <motion.div
                        className={dzClass}
                        animate={feedback === "wrong" ? { x:[0,-14,14,-10,10,-5,5,0] } : {}}
                        transition={{ duration:.55 }}
                        aria-label="Your answer area" aria-live="polite"
                        style={{ marginBottom:14 }}
                    >
                        {placedTiles.length === 0 ? (
                            <span style={{ color:"#A5B4FC", fontSize:19, letterSpacing:".06em", fontWeight:700 }}>
                                👆 Tap letters below to spell the word
                            </span>
                        ) : (
                            <AnimatePresence>
                                {placedTiles.map(tile => (
                                    <motion.button
                                        key={tile.uid} layout
                                        initial={{ scale:0, opacity:0, rotate:-18 }}
                                        animate={{ scale:1, opacity:1, rotate:0 }}
                                        exit={{ scale:0, opacity:0 }}
                                        transition={{ type:"spring", stiffness:290, damping:18 }}
                                        className={tileStateClass("placed")}
                                        onClick={() => unpickLetter(tile)}
                                        aria-label={`Remove letter ${tile.letter}`}
                                        disabled={!!feedback}
                                    >
                                        {tile.letter}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        )}
                    </motion.div>

                    {/* ── Feedback toast ── */}
                    <AnimatePresence>
                        {feedback && (
                            <motion.p key="fb"
                                initial={{ opacity:0, scale:.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                                style={{ fontFamily:"Nunito,sans-serif", fontWeight:900, fontSize:24, marginBottom:10, color: feedback==="correct"?"#15803D":"#B91C1C" }}
                                role="alert">
                                {feedback==="correct" ? "🎉 Brilliant! That's correct!" : "❌ Oops! Give it another go!"}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* ── Extra hint after 2 wrong tries ── */}
                    <AnimatePresence>
                        {wrongCount >= 2 && !feedback && (
                            <motion.div key="xhint"
                                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                                style={{ background:"#FFFBEB", border:"3px solid #FDE68A", borderRadius:18, padding:"13px 24px", fontSize:18, color:"#92400E", fontWeight:700, marginBottom:14, textAlign:"center", width:"100%", letterSpacing:".03em" }}
                                role="alert">
                                🌟 It has <strong style={{fontSize:22}}>{challenge.word.length}</strong> letters and starts with&nbsp;
                                <strong style={{ fontSize:26, color:"#D97706" }}>{challenge.word[0]}</strong>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Letter bank ──────────────────────────────────────────────────────
                        FIX C: tiles are scattered with staggered marginTop values so they
                        NEVER appear in a straight horizontal line.
                        The trulyScramble() ensures order is never the word itself.        */}
                    <div
                        style={{
                            display:"flex", flexWrap:"wrap", gap:14,
                            justifyContent:"center", alignItems:"flex-end",
                            marginBottom:26, width:"100%", padding:"4px 0 8px",
                        }}
                        aria-label="Available letters to tap" role="group"
                    >
                        <AnimatePresence>
                            {bankTiles.map((tile, i) => {
                                // Varying vertical offsets so tiles form a wave, not a line
                                const vertOffsets = [0, 14, 28, 10, 22, 6, 18, 32, 4, 20];
                                const mt = vertOffsets[i % vertOffsets.length];
                                return (
                                    <motion.button
                                        key={tile.uid} layout
                                        initial={{ scale:0, opacity:0, rotate: i%2===0 ? -20 : 20, y:20 }}
                                        animate={{ scale:1, opacity:1, rotate:0, y:0 }}
                                        exit={{ scale:0, opacity:0 }}
                                        transition={{ type:"spring", stiffness:260, damping:16, delay: i*0.05 }}
                                        className={feedback ? "pg-tile pg-disabled" : "pg-tile pg-bank"}
                                        onClick={() => pickLetter(tile)}
                                        aria-label={`Tap letter ${tile.letter}`}
                                        disabled={!!feedback}
                                        style={{ marginTop: mt }}
                                    >
                                        {tile.letter}
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* ── Check answer button ── */}
                    <button
                        className={chkClass}
                        onClick={checkAnswer}
                        disabled={!canCheck}
                        aria-label={canCheck ? "Check my answer" : `Need ${challenge?.word.length} letters`}
                    >
                        {feedback === "correct" ? "🎉 Correct! Moving on…"
                         : feedback === "wrong"  ? "❌ Wrong — try again!"
                         : canCheck             ? "✅ Check My Answer"
                         : `Fill all ${challenge?.word.length} letters first`}
                    </button>

                </div>
            </ModuleShell>
        </div>
    );
}