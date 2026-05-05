"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Clock } from "lucide-react";

interface Props {
  plannedMinutes: number;
  plannedCalories: number;
  onTimeUpdate?: (seconds: number, adjustedCalories: number) => void;
}

export default function WorkoutTimer({ plannedMinutes, plannedCalories, onTimeUpdate }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          // Adjust calories based on actual time vs planned
          const ratio = next / (plannedMinutes * 60);
          const adjusted = Math.round(plannedCalories * Math.min(ratio, 1.5));
          onTimeUpdate?.(next, adjusted);
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, plannedMinutes, plannedCalories]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const plannedSecs = plannedMinutes * 60;
  const progress = Math.min(100, (seconds / plannedSecs) * 100);

  // Adjusted calorie estimate
  const ratio = seconds > 0 ? seconds / plannedSecs : 0;
  const adjustedCalories = Math.round(plannedCalories * Math.min(ratio, 1.5));

  const isOvertime = seconds > plannedSecs;

  return (
    <div className={`rounded-2xl p-4 border flex items-center gap-4 flex-wrap ${
      isOvertime
        ? "bg-amber-500/10 border-amber-500/20"
        : "bg-gray-800 border-gray-700"
    }`}>
      {/* Timer display */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          running ? "bg-emerald-500/20" : "bg-gray-700"
        }`}>
          <Clock className={`w-5 h-5 ${running ? "text-emerald-400" : "text-gray-400"}`} />
        </div>
        <div>
          <p className="text-white font-bold text-xl font-mono">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
          <p className="text-gray-500 text-xs">{plannedMinutes}m planned</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1 min-w-24">
        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              isOvertime ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className={`text-xs ${isOvertime ? "text-amber-400" : "text-gray-500"}`}>
          {isOvertime
            ? `${Math.floor((seconds - plannedSecs) / 60)}m overtime`
            : `${Math.round(progress)}% complete`}
        </p>
      </div>

      {/* Live calorie estimate */}
      <div className="text-center">
        <p className="text-orange-400 font-bold text-lg">{adjustedCalories}</p>
        <p className="text-gray-500 text-xs">cal burned</p>
      </div>

      {/* Pause/Resume */}
      <button
        onClick={() => setRunning((r) => !r)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          running ? "bg-gray-700 hover:bg-gray-600" : "bg-emerald-500 hover:bg-emerald-600"
        }`}
      >
        {running
          ? <Pause className="w-4 h-4 text-white" />
          : <Play className="w-4 h-4 text-white" />}
      </button>
    </div>
  );
}