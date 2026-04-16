"use client";
import { useState, useEffect } from "react";
import { Flame, Utensils, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface DayRecord {
  caloriesBurned: number;
  caloriesEaten: number;
  netCalories: number;
  workoutDone: boolean;
}

export default function CalorieTracker() {
  const [data, setData] = useState<{
    today: DayRecord;
    totalDeficit: number;
    avgDailyDeficit: number;
    daysTracked: number;
    history: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calories/track")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-48 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const today = data?.today || { caloriesBurned: 0, caloriesEaten: 0, netCalories: 0, workoutDone: false };
  const net = today.netCalories || (today.caloriesBurned - today.caloriesEaten);
  const isDeficit = net > 0; // burned more = deficit = weight loss
  const isSurplus = net < 0; // ate more = surplus = weight gain

  // For weight loss: 7700 calories = 1kg
  const totalDeficit = data?.totalDeficit || 0;
  const weightLostGrams = Math.abs(totalDeficit / 7.7); // rough estimate
  const kgLost = (weightLostGrams / 1000).toFixed(2);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Today&apos;s Calorie Balance
        </h2>
        <span className="text-gray-500 text-xs">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Main 3 stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-white font-bold text-xl">{today.caloriesBurned}</p>
          <p className="text-orange-400 text-xs font-medium">Burned</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <Utensils className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-white font-bold text-xl">{today.caloriesEaten}</p>
          <p className="text-blue-400 text-xs font-medium">Eaten</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${
          isDeficit
            ? "bg-emerald-500/10 border-emerald-500/20"
            : isSurplus
            ? "bg-red-500/10 border-red-500/20"
            : "bg-gray-800 border-gray-700"
        }`}>
          {isDeficit ? (
            <TrendingDown className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          ) : isSurplus ? (
            <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-1" />
          ) : (
            <Minus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          )}
          <p className={`font-bold text-xl ${isDeficit ? "text-emerald-400" : isSurplus ? "text-red-400" : "text-white"}`}>
            {Math.abs(net)}
          </p>
          <p className={`text-xs font-medium ${isDeficit ? "text-emerald-400" : isSurplus ? "text-red-400" : "text-gray-400"}`}>
            {isDeficit ? "Deficit ✅" : isSurplus ? "Surplus ⚠️" : "Balanced"}
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className={`rounded-xl p-3 mb-4 text-sm ${
        isDeficit
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : isSurplus
          ? "bg-amber-500/10 border border-amber-500/20"
          : "bg-gray-800"
      }`}>
        {today.caloriesBurned === 0 && today.caloriesEaten === 0 ? (
          <p className="text-gray-400">Complete a workout and log your meals to see your calorie balance today.</p>
        ) : isDeficit ? (
          <p className="text-emerald-400">
            🔥 You&apos;re in a <strong>{net} calorie deficit</strong> today. Your body is burning stored fat for energy. Keep it up!
          </p>
        ) : isSurplus ? (
          <p className="text-amber-400">
            ⚠️ You&apos;re in a <strong>{Math.abs(net)} calorie surplus</strong> today. You ate more than you burned. Consider a light workout.
          </p>
        ) : (
          <p className="text-gray-400">You&apos;re balanced today — burned = eaten.</p>
        )}
      </div>

      {/* 30-day progress */}
      {data && data.daysTracked > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/60 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Total Deficit ({data.daysTracked}d)</p>
            <p className="text-white font-bold">{Math.abs(totalDeficit).toLocaleString()} cal</p>
            <p className="text-emerald-400 text-xs">≈ {kgLost}kg weight change</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3">
            <p className="text-gray-500 text-xs mb-1">Daily Avg Deficit</p>
            <p className={`font-bold ${data.avgDailyDeficit > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {Math.abs(data.avgDailyDeficit)} cal/day
            </p>
            <p className="text-gray-500 text-xs">
              {data.avgDailyDeficit > 500 ? "Excellent pace! 🔥" :
               data.avgDailyDeficit > 200 ? "Good progress ✅" : "Needs improvement"}
            </p>
          </div>
        </div>
      )}

      {/* Weekly chart */}
      {data && data.history.length > 0 && (
        <div className="mt-4">
          <p className="text-gray-500 text-xs mb-2">Last 7 days</p>
          <div className="flex items-end gap-1 h-16">
            {data.history.slice(0, 7).reverse().map((day: any, i: number) => {
              const net = day.netCalories || 0;
              const maxVal = 600;
              const height = Math.min(100, Math.abs(net) / maxVal * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${net > 0 ? "bg-emerald-500" : net < 0 ? "bg-red-400" : "bg-gray-700"}`}
                    style={{ height: `${Math.max(4, height)}%` }}
                  />
                  <span className="text-gray-600 text-xs">
                    {new Date(day.date).toLocaleDateString("en-IN", { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Deficit</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm" /> Surplus</span>
          </div>
        </div>
      )}
    </div>
  );
}