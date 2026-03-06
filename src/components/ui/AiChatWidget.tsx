"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { AnimatePresence, motion } from "framer-motion";

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: "Hi! I'm Owly 🦉. I can help you learn! Ask me anything." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");

        // Simulate AI Response
        setTimeout(() => {
            const lowerInput = userMsg.toLowerCase();
            let botResponse = "";

            // 1. Simple Math Solver
            // Matches "what is 2 + 2", "5*5", etc.
            const mathMatch = lowerInput.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
            if (mathMatch) {
                const [_, n1, op, n2] = mathMatch;
                const num1 = parseInt(n1);
                const num2 = parseInt(n2);
                let result = 0;

                switch (op) {
                    case '+': result = num1 + num2; break;
                    case '-': result = num1 - num2; break;
                    case '*': result = num1 * num2; break;
                    case '/': result = Math.floor(num1 / num2); break;
                }
                botResponse = `That's a math problem! ${num1} ${op} ${num2} equals ${result}.`;
            }

            // 2. Keyword Matching with Randomized Responses
            else if (lowerInput.includes("hello") || lowerInput.includes("hi ") || lowerInput === "hi") {
                const greetings = [
                    "Hoot hoot! Hi there! 👋",
                    "Hello friend! Ready to learn?",
                    "Hi! I'm Owly. How can I help you today?"
                ];
                botResponse = greetings[Math.floor(Math.random() * greetings.length)];
            }
            else if (lowerInput.includes("math") || lowerInput.includes("number") || lowerInput.includes("count")) {
                const mathTips = [
                    "Math is fun! Try using your fingers to count.",
                    "If you get stuck, try the Shape Sorter game to practice!",
                    "Remember, practice makes progress. You're doing great at math!",
                    "Need help adding? Try drawing dots on a paper."
                ];
                botResponse = mathTips[Math.floor(Math.random() * mathTips.length)];
            }
            else if (lowerInput.includes("read") || lowerInput.includes("spell") || lowerInput.includes("word")) {
                const readingTips = [
                    "Take your time! Sound out each letter slowly.",
                    "Look for words you know, like 'the' or 'and'.",
                    "Phonics Adventure is a great place to practice spelling!",
                    "Try reading the word out loud. It helps!"
                ];
                botResponse = readingTips[Math.floor(Math.random() * readingTips.length)];
            }
            else if (lowerInput.includes("tired") || lowerInput.includes("break") || lowerInput.includes("hard")) {
                const comfort = [
                    "It's okay to take a break! Your brain grows when you rest.",
                    "Take a deep breath. In... and out. You got this!",
                    "Learning is hard work. I'm proud of you for trying!",
                    "Maybe grab a glass of water and come back in 5 minutes?"
                ];
                botResponse = comfort[Math.floor(Math.random() * comfort.length)];
            }
            else if (lowerInput.includes("joke") || lowerInput.includes("funny")) {
                const jokes = [
                    "Why did the math book look sad? Because it had too many problems! 😂",
                    "What is a snake's favorite subject? Hiss-tory! 🐍",
                    "Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰",
                    "What acts like a cat but looks like a lemon? A sour-puss! 🐱"
                ];
                botResponse = jokes[Math.floor(Math.random() * jokes.length)];
            }

            // 3. Fallback
            else {
                const fallbacks = [
                    "That's interesting! Tell me more.",
                    "You're doing an amazing job today!",
                    "Keep up the good work, superstar! ⭐",
                    "I'm here to help. You can ask me about math, reading, or ask for a joke!",
                    "Hoot hoot! You are smart!"
                ];
                botResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        }, 800);
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
                                <span className="font-bold">Owly Tutor</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                            <input
                                className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Ask for help..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button onClick={handleSend} className="bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-violet-700 transition-colors">
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
