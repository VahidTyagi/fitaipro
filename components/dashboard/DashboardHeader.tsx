"use client";
import { useState } from "react";
import { Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  user: { name?: string | null; email?: string | null };
  trialActive: boolean;
  daysLeft: number;
  isPaid?: boolean;
  plan?: string;
}

export default function DashboardHeader({ user, trialActive, daysLeft, isPaid, plan }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [sending, setSending] = useState(false);

  const sendFeedback = async () => {
    if (!feedbackMsg.trim()) { toast.error("Please write your feedback"); return; }
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          message: feedbackMsg,
          page: typeof window !== "undefined" ? window.location.pathname : "unknown",
        }),
      });
      toast.success("Feedback sent! Thank you 🙏");
      setShowFeedback(false);
      setFeedbackMsg("");
    } catch {
      toast.error("Failed to send. Try emailing fitaipro.official@gmail.com");
    } finally {
      setSending(false);
    }
  };

  const displayName = () => {
    const n = user.name;
    if (n && !n.includes("@") && !n.includes("+")) return n.split(" ")[0];
    const email = user.email || "";
    return email.split("@")[0].split("+")[0].split(".")[0].charAt(0).toUpperCase() +
      email.split("@")[0].split("+")[0].split(".")[0].slice(1);
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="ml-12 md:ml-0">
          <h1 className="text-white font-bold text-lg hidden md:block">
            Welcome back, {displayName()} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Plan Badge */}
          {isPaid ? (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-xs font-medium capitalize">
                {plan} — {daysLeft}d left
              </span>
            </div>
          ) : trialActive ? (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} free left
              </span>
            </div>
          ) : (
            <Link
              href="/pricing"
              className="hidden sm:block bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Upgrade Now
            </Link>
          )}

          {/* Feedback Button */}
          <button
            onClick={() => setShowFeedback(true)}
            className="w-9 h-9 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors"
            title="Send Feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Bell */}
          <button className="w-9 h-9 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Feedback Modal */}
      {showFeedback && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFeedback(false); }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-1">Send Feedback 💬</h3>
            <p className="text-gray-400 text-sm mb-4">Help us improve FitAI Pro</p>

            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">✨ Feature Request</option>
              <option value="general">💬 General Feedback</option>
              <option value="diet">🥗 Diet/Nutrition Issue</option>
              <option value="workout">💪 Workout Issue</option>
            </select>

            <textarea
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500 resize-none placeholder:text-gray-600"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowFeedback(false); setFeedbackMsg(""); }}
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendFeedback}
                disabled={sending}
                className="flex-1 bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}