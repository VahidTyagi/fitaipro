"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Zap, User, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "How many calories should I eat to lose weight?",
  "What should I eat before a workout?",
  "How do I fix bad posture from sitting all day?",
  "How many rest days should I take per week?",
  "What is progressive overload?",
  "How do I build muscle as a vegetarian in India?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm your AI fitness coach 🤖💪 I can help with workout advice, nutrition tips, recovery, and anything fitness-related. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

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
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch {
      toast.error("Failed to get response. Check API connection.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! What would you like to know? 💪",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-180px)]">
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
        <button
          onClick={clearChat}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-xl transition-all hover:border-gray-500"
        >
          <RefreshCw className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
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

            {/* Bubble */}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-sm"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-sm"
            )}>
              {msg.content}
              <p className={cn(
                "text-xs mt-1",
                msg.role === "assistant" ? "text-gray-600" : "text-emerald-100"
              )}>
                {msg.timestamp.toLocaleTimeString("en-IN", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions (show only at start) */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-gray-500 text-xs mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((q) => (
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
          placeholder="Ask your AI coach anything..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-40 flex-shrink-0"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}