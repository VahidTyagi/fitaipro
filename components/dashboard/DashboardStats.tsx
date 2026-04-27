"use client";
import { useEffect, useState } from "react";
import { Dumbbell, Utensils, Flame, TrendingDown, TrendingUp, Scale } from "lucide-react";

interface Stats {
  totalWorkouts: number;
  workoutToday: boolean;
  totalMeals: number;
  currentWeight: number;
  targetWeight: number;
  totalCalories: number;
  caloriesEaten: number;
  netCalories: number;
}

const defaultStats: Stats = {
  totalWorkouts: 0,
  workoutToday: false,
  totalMeals: 0,
  currentWeight: 0,
  targetWeight: 0,
  totalCalories: 0,
  caloriesEaten: 0,
  netCalories: 0,
};

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        // Safe merge — never let undefined into state
        setStats({
          totalWorkouts: data.totalWorkouts ?? 0,
          workoutToday: data.workoutToday ?? false,
          totalMeals: data.totalMeals ?? 0,
          currentWeight: data.currentWeight ?? 0,
          targetWeight: data.targetWeight ?? 0,
          totalCalories: data.totalCalories ?? 0,
          caloriesEaten: data.caloriesEaten ?? 0,
          netCalories: data.netCalories ?? 0,
        });
      })
      .catch(() => setStats(defaultStats))
      .finally(() => setLoading(false));
  }, []);

  const weightDiff = stats.targetWeight > 0 && stats.currentWeight > 0
    ? stats.currentWeight - stats.targetWeight
    : 0;

  const isDeficit = stats.netCalories > 0;
  const isSurplus = stats.netCalories < 0;

  const statCards = [
    {
      label: "Workouts Done",
      value: stats.totalWorkouts.toLocaleString(),
      icon: Dumbbell,
      color: "from-emerald-500 to-teal-500",
      badge: stats.workoutToday ? "✅ Done Today" : "💪 Start Today",
      badgeColor: stats.workoutToday ? "text-emerald-400" : "text-gray-400",
    },
    {
      label: "Calories Burned",
      value: stats.totalCalories.toLocaleString(),
      icon: Flame,
      color: "from-orange-500 to-amber-500",
      badge: "Today",
      badgeColor: "text-orange-400",
    },
    {
      label: "Calories Eaten",
      value: stats.caloriesEaten.toLocaleString(),
      icon: Utensils,
      color: "from-blue-500 to-cyan-500",
      badge: `${stats.totalMeals} meals logged`,
      badgeColor: "text-blue-400",
    },
    {
      label: "Net Balance",
      value: `${Math.abs(stats.netCalories).toLocaleString()} cal`,
      icon: isDeficit ? TrendingDown : isSurplus ? TrendingUp : Scale,
      color: isDeficit
        ? "from-emerald-500 to-green-500"
        : isSurplus
        ? "from-red-500 to-rose-500"
        : "from-gray-500 to-gray-600",
      badge: isDeficit ? "🔥 Deficit" : isSurplus ? "⚠️ Surplus" : "⚖️ Balanced",
      badgeColor: isDeficit
        ? "text-emerald-400"
        : isSurplus
        ? "text-red-400"
        : "text-gray-400",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
            <div className="h-8 bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map(({ label, value, icon: Icon, color, badge, badgeColor }) => (
        <div
          key={label}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors"
        >
          <div
            className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          <p className={`text-xs font-medium ${badgeColor}`}>{badge}</p>
        </div>
      ))}

      {/* Weight progress bar */}
      {weightDiff > 0 && (
        <div className="col-span-2 md:col-span-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold">Weight Goal Progress</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {stats.currentWeight}kg → {stats.targetWeight}kg
                {" · "}
                <span className="text-emerald-400 font-medium">
                  {weightDiff.toFixed(1)}kg to go
                </span>
              </p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    5,
                    ((stats.currentWeight - weightDiff) /
                      stats.currentWeight) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}