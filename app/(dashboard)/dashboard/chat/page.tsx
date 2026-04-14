"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Zap, User, RefreshCw, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/soundEffects";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "How many calories should I eat to lose weight?",
  "What should I eat before a workout?",
  "How do I build muscle as a vegetarian in India?",
  "How many rest days per week?",
  "What is progressive overload?",
  "Best Indian foods for protein?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm your AI fitness coach 🤖💪 Ask me anything about workouts, nutrition, recovery, or fitness goals!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLeft, setMessagesLeft] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [rateLimitHit, setRateLimitHit] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    sounds.tap();

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (res.status === 403 || res.status === 429) {
        setRateLimitHit(true);
        setUpgradeRequired(data.upgradeRequired || false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "You've reached your daily message limit.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (!res.ok) throw new Error("Failed");

      sounds.tap();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);

      if (data.messagesLeft !== undefined) {
        setMessagesLeft(data.messagesLeft);
        setDailyLimit(data.dailyLimit);
      }
    } catch {
      toast.error("Failed to get response. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">AI Fitness Coach</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Usage indicator */}
        {messagesLeft !== null && dailyLimit !== null && (
          <div className={cn(
            "text-xs px-3 py-1.5 rounded-full border",
            messagesLeft <= 2
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-gray-800 border-gray-700 text-gray-400"
          )}>
            {messagesLeft}/{dailyLimit} left today
          </div>
        )}
      </div>

      {/* Rate limit banner */}
      {rateLimitHit && upgradeRequired && (
        <div className="flex-shrink-0 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-semibold text-sm">Daily limit reached</p>
              <p className="text-gray-400 text-xs">Upgrade to Pro for 100 messages/day</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "assistant"
                ? "bg-gradient-to-br from-purple-500 to-pink-500"
                : "bg-gradient-to-br from-emerald-500 to-teal-500"
            )}>
              {msg.role === "assistant" ? (
                <Zap className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-sm"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-sm"
            )}>
              {msg.content}
              <p className={cn("text-xs mt-1", msg.role === "assistant" ? "text-gray-600" : "text-emerald-100")}>
                {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-gray-500 text-xs mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-gray-900 border border-gray-700 text-gray-300 hover:text-white hover:border-emerald-500/50 px-3 py-1.5 rounded-full transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={rateLimitHit && upgradeRequired ? "Upgrade to continue chatting..." : "Ask your AI coach anything..."}
          disabled={rateLimitHit && upgradeRequired}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || (rateLimitHit && upgradeRequired)}
          className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}