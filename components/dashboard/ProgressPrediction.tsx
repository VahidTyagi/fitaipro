"use client";
import { TrendingDown, Target, Calendar } from "lucide-react";

interface Props {
  currentWeight: number | null;
  targetWeight: number | null;
  goal: string | null;
  workoutsDone: number;
}

export default function ProgressPrediction({ currentWeight, targetWeight, goal, workoutsDone }: Props) {
  if (!currentWeight || !targetWeight || currentWeight <= targetWeight) return null;

  const weightToLose = currentWeight - targetWeight;

  // Science-based calculation
  // Average healthy weight loss: 0.5-1kg per week with exercise + diet
  // 1 workout/week = 0.3kg/week, 3/week = 0.6kg/week, 5+/week = 0.8kg/week
  const weeklyRate = workoutsDone >= 5 ? 0.8 : workoutsDone >= 3 ? 0.6 : 0.4;
  const weeksNeeded = Math.ceil(weightToLose / weeklyRate);
  const monthsNeeded = Math.ceil(weeksNeeded / 4.3);

  const milestone1 = Math.round(currentWeight - weightToLose * 0.25);
  const milestone2 = Math.round(currentWeight - weightToLose * 0.5);
  const weeks4 = Math.round(currentWeight - weeklyRate * 4);
  const weeks12 = Math.max(targetWeight, Math.round(currentWeight - weeklyRate * 12));

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-emerald-400" />
        <h2 className="text-white font-bold">Your Progress Prediction</h2>
        <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">AI Estimate</span>
      </div>

      {/* Main prediction */}
      <div className="bg-gray-900/80 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <TrendingDown className="w-6 h-6 text-emerald-400" />
          <p className="text-white font-bold text-lg">
            Reach {targetWeight}kg in ~{monthsNeeded} month{monthsNeeded !== 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-gray-400 text-sm">
          Following your workout plan + nutrition guide, you can lose
          <span className="text-emerald-400 font-bold"> {weightToLose}kg </span>
          in approximately {weeksNeeded} weeks.
        </p>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "4 weeks", weight: `~${weeks4}kg`, color: "text-blue-400" },
          { label: "3 months", weight: `~${weeks12}kg`, color: "text-purple-400" },
          { label: "Goal", weight: `${targetWeight}kg ✅`, color: "text-emerald-400" },
        ].map(({ label, weight, color }) => (
          <div key={label} className="bg-gray-900/80 rounded-xl p-3 text-center">
            <p className={`font-bold ${color}`}>{weight}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {[
          { label: "25% progress", weight: milestone1, weeks: Math.ceil(weeksNeeded * 0.25) },
          { label: "Halfway there! 🎉", weight: milestone2, weeks: Math.ceil(weeksNeeded * 0.5) },
          { label: "Goal reached! 🏆", weight: targetWeight, weeks: weeksNeeded },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-xs font-bold">{i + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">{m.label}</span>
                <span className="text-white font-bold text-sm">{m.weight}kg</span>
              </div>
              <p className="text-gray-600 text-xs">~{m.weeks} week{m.weeks !== 1 ? "s" : ""} from now</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs text-center mt-4">
        * Estimates based on 0.5-1kg/week healthy weight loss. Results vary individually.
      </p>
    </div>
  );
}