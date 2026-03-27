 "use client";

// import { useState, useRef, useEffect } from "react";
// import { Button } from "./Button";
// import { AnimatePresence, motion } from "framer-motion";

// export function AiChatWidget() {
//     const [isOpen, setIsOpen] = useState(false);
//     const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
//         { role: 'bot', text: "Hi! I'm Owly 🦉. I can help you learn! Ask me anything." }
//     ]);
//     const [input, setInput] = useState("");
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     const handleSend = () => {
//         if (!input.trim()) return;

//         const userMsg = input;
//         setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
//         setInput("");

//         // Simulate AI Response
//         setTimeout(() => {
//             const lowerInput = userMsg.toLowerCase();
//             let botResponse = "";

//             // 1. Simple Math Solver
//             // Matches "what is 2 + 2", "5*5", etc.
//             const mathMatch = lowerInput.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
//             if (mathMatch) {
//                 const [_, n1, op, n2] = mathMatch;
//                 const num1 = parseInt(n1);
//                 const num2 = parseInt(n2);
//                 let result = 0;

//                 switch (op) {
//                     case '+': result = num1 + num2; break;
//                     case '-': result = num1 - num2; break;
//                     case '*': result = num1 * num2; break;
//                     case '/': result = Math.floor(num1 / num2); break;
//                 }
//                 botResponse = `That's a math problem! ${num1} ${op} ${num2} equals ${result}.`;
//             }

//             // 2. Keyword Matching with Randomized Responses
//             else if (lowerInput.includes("hello") || lowerInput.includes("hi ") || lowerInput === "hi") {
//                 const greetings = [
//                     "Hoot hoot! Hi there! 👋",
//                     "Hello friend! Ready to learn?",
//                     "Hi! I'm Owly. How can I help you today?"
//                 ];
//                 botResponse = greetings[Math.floor(Math.random() * greetings.length)];
//             }
//             else if (lowerInput.includes("math") || lowerInput.includes("number") || lowerInput.includes("count")) {
//                 const mathTips = [
//                     "Math is fun! Try using your fingers to count.",
//                     "If you get stuck, try the Shape Sorter game to practice!",
//                     "Remember, practice makes progress. You're doing great at math!",
//                     "Need help adding? Try drawing dots on a paper."
//                 ];
//                 botResponse = mathTips[Math.floor(Math.random() * mathTips.length)];
//             }
//             else if (lowerInput.includes("read") || lowerInput.includes("spell") || lowerInput.includes("word")) {
//                 const readingTips = [
//                     "Take your time! Sound out each letter slowly.",
//                     "Look for words you know, like 'the' or 'and'.",
//                     "Phonics Adventure is a great place to practice spelling!",
//                     "Try reading the word out loud. It helps!"
//                 ];
//                 botResponse = readingTips[Math.floor(Math.random() * readingTips.length)];
//             }
//             else if (lowerInput.includes("tired") || lowerInput.includes("break") || lowerInput.includes("hard")) {
//                 const comfort = [
//                     "It's okay to take a break! Your brain grows when you rest.",
//                     "Take a deep breath. In... and out. You got this!",
//                     "Learning is hard work. I'm proud of you for trying!",
//                     "Maybe grab a glass of water and come back in 5 minutes?"
//                 ];
//                 botResponse = comfort[Math.floor(Math.random() * comfort.length)];
//             }
//             else if (lowerInput.includes("joke") || lowerInput.includes("funny")) {
//                 const jokes = [
//                     "Why did the math book look sad? Because it had too many problems! 😂",
//                     "What is a snake's favorite subject? Hiss-tory! 🐍",
//                     "Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰",
//                     "What acts like a cat but looks like a lemon? A sour-puss! 🐱"
//                 ];
//                 botResponse = jokes[Math.floor(Math.random() * jokes.length)];
//             }

//             // 3. Fallback
//             else {
//                 const fallbacks = [
//                     "That's interesting! Tell me more.",
//                     "You're doing an amazing job today!",
//                     "Keep up the good work, superstar! ⭐",
//                     "I'm here to help. You can ask me about math, reading, or ask for a joke!",
//                     "Hoot hoot! You are smart!"
//                 ];
//                 botResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
//             }

//             setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
//         }, 800);
//     };

//     return (
//         <div className="fixed bottom-6 left-6 z-50">
//             <AnimatePresence>
//                 {isOpen && (
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.8, y: 20 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.8, y: 20 }}
//                         className="mb-4 bg-white dark:bg-slate-800 w-80 h-96 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
//                     >
//                         {/* Header */}
//                         <div className="bg-violet-600 p-4 text-white flex justify-between items-center">
//                             <div className="flex items-center gap-2">
//                                 <span className="text-2xl">🦉</span>
//                                 <span className="font-bold">Owly Tutor</span>
//                             </div>
//                             <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
//                         </div>

//                         {/* Messages */}
//                         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
//                             {messages.map((msg, idx) => (
//                                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
//                                         ? 'bg-violet-600 text-white rounded-tr-none'
//                                         : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none'
//                                         }`}>
//                                         {msg.text}
//                                     </div>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} />
//                         </div>

//                         {/* Input */}
//                         <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
//                             <input
//                                 className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//                                 placeholder="Ask for help..."
//                                 value={input}
//                                 onChange={e => setInput(e.target.value)}
//                                 onKeyDown={e => e.key === 'Enter' && handleSend()}
//                             />
//                             <button onClick={handleSend} className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-violet-700 transition-colors">
//                                 ↑
//                             </button>
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             <Button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="h-16 w-16 rounded-full shadow-2xl bg-white text-4xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-violet-100"
//             >
//                 🦉
//             </Button>
//         </div>
//     );
// }



//"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { AnimatePresence, motion } from "framer-motion";

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are Owly 🦉, a warm, encouraging, and patient AI tutor inside the LearnAble app — a learning disability support platform for children.

LearnAble helps kids with:
- Dyslexia (reading & spelling difficulties)
- Dysgraphia (handwriting & writing difficulties)
- Dyscalculia (math & number difficulties)

Your role:
- Answer questions in simple, kind, child-friendly language (assume age 6–14)
- Help with reading, spelling, writing, and math topics
- Offer encouragement and emotional support
- Suggest relevant in-app activities (Phonics Game, Sight Word Safari, Math Race, Shape Sorter, Maze Master, Tracing Game)
- Tell age-appropriate jokes if asked
- Never diagnose or make clinical claims — always say "talk to a specialist" for medical questions
- Keep responses short (2-4 sentences max) unless explaining a concept
- Use emojis occasionally to feel warm and fun 🌟`;

type Message = { role: "user" | "bot"; text: string };

async function callGroq(history: Message[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("NEXT_PUBLIC_GROQ_API_KEY is not set in .env.local");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text,
        })),
      ],
      max_tokens: 200,
      temperature: 0.8,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Groq API error:", JSON.stringify(data, null, 2));
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    console.error("Unexpected Groq response:", JSON.stringify(data, null, 2));
    throw new Error("Empty response from Groq");
  }

  return text;
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm Owly 🦉. I'm here to help you learn! Ask me anything — math, reading, or just say hi!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const botText = await callGroq(updatedMessages);
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "Unknown error");
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Oops! I had a little trouble thinking. Try again in a moment 🦉" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white dark:bg-slate-800 w-80 h-96 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-violet-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦉</span>
                <div>
                  <p className="font-bold leading-none">Owly Tutor</p>
                  <p className="text-xs text-violet-200">Powered by Groq AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Debug error banner */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 px-3 py-1.5 text-red-600 text-xs font-mono break-all">
                ⚠ {error}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-700 shadow-sm rounded-2xl rounded-tl-none p-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 bg-violet-400 rounded-full block"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
              <input
                className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                placeholder="Ask Owly anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full shadow-2xl bg-white text-4xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-violet-100"
      >
        🦉
      </Button>
    </div>
  );
}