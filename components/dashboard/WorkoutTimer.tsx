"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Clock } from "lucide-react";

interface Props {
  plannedMinutes?: number;
  plannedCalories?: number;
  onTimeUpdate?: (seconds: number, adjustedCalories: number) => void;
}

export default function WorkoutTimer({
  plannedMinutes = 30,
  plannedCalories = 200,
  onTimeUpdate,
}: Props) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const safeMins = Math.max(plannedMinutes || 30, 1);
  const safeCals = Math.max(plannedCalories || 200, 1);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (onTimeUpdate) {
            const ratio = next / (safeMins * 60);
            const adj = Math.round(safeCals * Math.min(ratio, 1.5));
            onTimeUpdate(next, adj);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, safeMins, safeCals]);

  const displayMins = Math.floor(seconds / 60);
  const displaySecs = seconds % 60;
  const progress = Math.min(100, (seconds / (safeMins * 60)) * 100);
  const isOvertime = seconds > safeMins * 60;
  const adjustedCal = Math.round(safeCals * Math.min(seconds / (safeMins * 60), 1.5));

  return (
    <div
      className={`rounded-2xl p-4 border flex items-center gap-3 flex-wrap ${
        isOvertime
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-gray-800/80 border-gray-700"
      }`}
    >
      {/* Timer */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Clock className={`w-5 h-5 ${running ? "text-emerald-400" : "text-gray-500"}`} />
        <span className="text-white font-bold text-xl font-mono tabular-nums">
          {String(displayMins).padStart(2, "0")}:{String(displaySecs).padStart(2, "0")}
        </span>
        <span className="text-gray-500 text-xs">/ {safeMins}m</span>
      </div>

      {/* Progress bar */}
      <div className="flex-1 min-w-16">
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isOvertime ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Calories */}
      <span className="text-orange-400 font-bold text-sm flex-shrink-0">
        {adjustedCal} cal
      </span>

      {/* Pause/Play */}
      <button
        onClick={() => setRunning((r) => !r)}
        className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors flex-shrink-0"
        title={running ? "Pause timer" : "Resume timer"}
      >
        {running ? (
          <Pause className="w-3.5 h-3.5 text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {isOvertime && (
        <span className="text-amber-400 text-xs font-medium flex-shrink-0">
          +{Math.floor((seconds - safeMins * 60) / 60)}m over
        </span>
      )}
    </div>
  );
}