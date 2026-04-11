"use client";
import { useEffect, useState } from "react";
import { Dumbbell, Flame, Zap, Trophy } from "lucide-react";

interface Stats {
  totalWorkouts: number;
  totalCalories: number;
  streak: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    totalCalories: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Workouts Done",
      value: stats.totalWorkouts,
      icon: Dumbbell,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Calories Burned",
      value: stats.totalCalories.toLocaleString(),
      icon: Flame,
      color: "from-orange-500 to-amber-500",
    },
    {
      label: "Day Streak",
      value: stats.streak,
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      suffix: stats.streak > 0 ? "🔥" : "",
    },
    {
      label: "Achievements",
      value: stats.totalWorkouts >= 10 ? "🏆" : `${stats.totalWorkouts}/10`,
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-gray-800 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {stat.value}{stat.suffix}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}