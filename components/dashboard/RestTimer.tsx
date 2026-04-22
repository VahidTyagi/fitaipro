"use client";
import { useState, useEffect, useRef } from "react";
import { sounds } from "@/lib/sounds";

interface Props {
  seconds: number; // rest time in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onComplete, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          sounds.restEnd();
          setTimeout(onComplete, 300);
          return 0;
        }
        if (prev <= 4) sounds.tick();
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
      <p className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Rest Time</p>

      {/* Circular progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-white">{remaining}</span>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-5">
        {remaining > 0 ? "Recover. Next exercise coming up..." : "Time's up! 💪"}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setRunning(r => !r)}
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition-colors text-sm"
        >
          {running ? "⏸ Pause" : "▶ Resume"}
        </button>
        <button
          onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); sounds.tap(); onSkip(); }}
          className="flex-1 bg-emerald-500 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-600 transition-colors text-sm"
        >
          Skip Rest →
        </button>
      </div>
    </div>
  );
}