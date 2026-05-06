"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Clock } from "lucide-react";

interface Props {
  plannedMinutes: number;
  plannedCalories: number;
  onTimeUpdate?: (seconds: number, adjustedCalories: number) => void;
}

export default function WorkoutTimer({
  plannedMinutes = 30,
  plannedCalories = 200,
  onTimeUpdate,
}: Props) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (onTimeUpdate) {
            const ratio = next / Math.max(plannedMinutes * 60, 1);
            const adj = Math.round(plannedCalories * Math.min(ratio, 1.5));
            onTimeUpdate(next, adj);
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const plannedSecs = Math.max(plannedMinutes * 60, 1);
  const progress = Math.min(100, (seconds / plannedSecs) * 100);
  const isOvertime = seconds > plannedSecs;
  const adjustedCal = Math.round(plannedCalories * Math.min(seconds / plannedSecs, 1.5));

  return (
    <div className={`rounded-2xl p-4 border flex items-center gap-3 flex-wrap ${
      isOvertime ? "bg-amber-500/10 border-amber-500/20" : "bg-gray-800 border-gray-700"
    }`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 ${running ? "text-emerald-400" : "text-gray-400"}`} />
        <span className="text-white font-bold text-xl font-mono">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
        <span className="text-gray-500 text-xs">/ {plannedMinutes}m</span>
      </div>

      <div className="flex-1 min-w-20">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isOvertime ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      <span className="text-orange-400 font-bold text-sm">{adjustedCal} cal</span>

      <button
        onClick={() => setRunning((r) => !r)}
        className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
      >
        {running ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
      </button>

      {isOvertime && (
        <span className="text-amber-400 text-xs font-medium">
          +{Math.floor((seconds - plannedSecs) / 60)}m overtime
        </span>
      )}
    </div>
  );
}