import Link from "next/link";
import { ArrowRight, Brain, Dumbbell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

const stats = [
  { value: "10K+", label: "Active Members" },
  { value: "500K+", label: "Workouts Logged" },
  { value: "4.9★", label: "App Rating" },
  { value: "98%", label: "Goal Achievement" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 overflow-hidden flex items-center">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Text */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">
                AI-Powered Fitness Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Your Personal
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                AI Fitness
              </span>
              Coach
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-lg">
              Custom workouts, smart nutrition plans, and real-time AI coaching
              that adapts to your body and goals. No generic plans — just results.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/sign-up">
                <Button size="lg" className="group w-full sm:w-auto">
                  Start For Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-800">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Phone Mockup */}
          <div className="hidden lg:flex items-center justify-center relative h-[580px]">
            {/* Phone */}
            <div className="w-72 h-[540px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] border border-gray-700 shadow-2xl flex flex-col overflow-hidden z-10">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-semibold">FitAI Pro</span>
                <span className="text-gray-500 text-xs">9:41</span>
              </div>
              {/* Content */}
              <div className="flex-1 p-4 space-y-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-500/20">
                  <p className="text-emerald-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                    Today&apos;s AI Plan
                  </p>
                  <p className="text-white font-bold text-lg">Push Day 💪</p>
                  <p className="text-gray-400 text-sm">6 exercises · 45 min · 320 cal</p>
                </div>
                {[
                  "Bench Press — 4×8",
                  "Shoulder Press — 3×10",
                  "Tricep Dips — 3×12",
                  "Cable Flyes — 3×15",
                ].map((ex) => (
                  <div
                    key={ex}
                    className="flex items-center gap-3 bg-gray-800/60 rounded-xl p-3"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{ex}</span>
                  </div>
                ))}
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">🤖 AI Coach says:</p>
                  <p className="text-gray-300 text-sm italic">
                    &quot;Increase bench by 5kg today — your recovery data looks great!&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card — Top Right */}
            <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-2xl p-4 w-48 z-20">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-2">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm">AI Coach</p>
              <p className="text-gray-500 text-xs">Personalizes every session</p>
            </div>

            {/* Floating Card — Bottom Left */}
            <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl p-4 w-48 z-20">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm">Progress</p>
              <p className="text-gray-500 text-xs">+12% strength this month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}