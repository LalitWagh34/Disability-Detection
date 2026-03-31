 "use client";

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