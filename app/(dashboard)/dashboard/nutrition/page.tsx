"use client";
import { useState, useEffect } from "react";
import { Lock, RefreshCw, Apple, Flame, Zap, Droplets, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Meal {
  type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
}

interface Day {
  day: number;
  totalCalories: number;
  totalProtein: number;
  meals: Meal[];
}

interface MealPlan {
  targetCalories: number;
  targetProtein: number;
  planDays: number;
  days: Day[];
}

const mealColors: Record<string, string> = {
  Breakfast: "border-amber-500/30 bg-amber-500/5",
  Lunch: "border-emerald-500/30 bg-emerald-500/5",
  Snack: "border-blue-500/30 bg-blue-500/5",
  Dinner: "border-purple-500/30 bg-purple-500/5",
};

const mealBadgeColors: Record<string, string> = {
  Breakfast: "bg-amber-500/20 text-amber-400",
  Lunch: "bg-emerald-500/20 text-emerald-400",
  Snack: "bg-blue-500/20 text-blue-400",
  Dinner: "bg-purple-500/20 text-purple-400",
};

export default function NutritionPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [userPlan, setUserPlan] = useState({ trialActive: true, daysLeft: 7, isPaid: false, plan: "free" });
  const [accessDenied, setAccessDenied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((data) => {
        setUserPlan(data);
        setLoaded(true);
        if (!data.trialActive) setAccessDenied(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const generatePlan = async (force = false) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/nutrition/generate", { method: "POST" });
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        toast.error("Upgrade to access diet plans");
        return;
      }

      if (!res.ok) throw new Error("Failed");

      setMealPlan(data.mealPlan);
      setSelectedDay(1);

      if (data.cached) {
        toast.success("Showing your saved plan ✅");
      } else {
        toast.success(`AI generated your ${data.mealPlan.planDays}-day meal plan! 🥗`);
      }
    } catch {
      toast.error("Failed to generate. Check API connection.");
    } finally {
      setGenerating(false);
    }
  };

  // Auto-load plan on mount if user has access
  useEffect(() => {
    if (loaded && userPlan.trialActive && !mealPlan) {
      generatePlan();
    }
  }, [loaded, userPlan.trialActive]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Diet Plans Locked</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your 7-day free trial has ended. Workouts remain free forever.
          Upgrade to Pro to get a 30-day AI-powered Indian meal plan.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-left">
          <p className="text-white font-semibold mb-3">Pro includes:</p>
          <ul className="space-y-2 text-sm text-gray-400">
            {["30-day AI meal plan (monthly)", "Indian cuisine optimized", "Regenerate anytime", "Macro tracking", "Calorie targets"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/pricing"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all inline-block"
        >
          Upgrade to Pro — ₹125/month 🔥
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Nutrition Plan</h1>
          <p className="text-gray-400">
            {userPlan.isPaid
              ? `Pro Plan — Personalized ${mealPlan?.planDays || 30}-day Indian meal plan`
              : `Free Trial — 7-day Indian meal plan (${userPlan.daysLeft} days left)`}
          </p>
        </div>
        <button
          onClick={() => generatePlan(true)}
          disabled={generating}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
        >
          {generating ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Zap className="w-4 h-4" /> {mealPlan ? "New Plan" : "Generate Plan"}</>
          )}
        </button>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl p-4 border ${userPlan.isPaid
        ? "bg-emerald-500/10 border-emerald-500/20"
        : "bg-amber-500/10 border-amber-500/20"}`}>
        <p className={`text-sm font-medium ${userPlan.isPaid ? "text-emerald-400" : "text-amber-400"}`}>
          {userPlan.isPaid
            ? `✅ Pro Plan Active — ${mealPlan?.planDays || 30}-day plan. Renew monthly for a fresh plan.`
            : `🎁 Free trial — ${userPlan.daysLeft} day${userPlan.daysLeft !== 1 ? "s" : ""} left. After trial, diet plans require Pro.`}
        </p>
      </div>

      {/* Generating state */}
      {generating && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">
            Creating your {userPlan.isPaid ? "30" : "7"}-day Indian meal plan...
          </h2>
          <p className="text-gray-400 text-sm">Personalizing for your goals and diet preferences</p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan */}
      {mealPlan && !generating && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Daily Calories", value: `${mealPlan.targetCalories} kcal`, icon: Flame, color: "text-orange-400" },
              { label: "Daily Protein", value: `${mealPlan.targetProtein}g`, icon: Zap, color: "text-emerald-400" },
              { label: "Days Planned", value: `${mealPlan.days.length} days`, icon: Apple, color: "text-blue-400" },
              { label: "Meals/Day", value: "4 meals", icon: Droplets, color: "text-purple-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <p className="text-white font-bold">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* Day selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Select Day</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
                  disabled={selectedDay === 1}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-bold text-sm px-3 py-1">Day {selectedDay}</span>
                <button
                  onClick={() => setSelectedDay(Math.min(mealPlan.days.length, selectedDay + 1))}
                  disabled={selectedDay === mealPlan.days.length}
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {mealPlan.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedDay === day.day
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  D{day.day}
                </button>
              ))}
            </div>
          </div>

          {/* Selected day meals */}
          {(() => {
            const day = mealPlan.days.find((d) => d.day === selectedDay);
            if (!day) return null;
            return (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-xl">Day {day.day}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      <span className="text-white font-bold">{day.totalCalories}</span> cal
                    </span>
                    <span className="text-gray-400">
                      <span className="text-emerald-400 font-bold">{day.totalProtein}g</span> protein
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {day.meals.map((meal, i) => (
                    <div key={i} className={`border rounded-2xl p-5 ${mealColors[meal.type] || "border-gray-700 bg-gray-800/30"}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${mealBadgeColors[meal.type] || "bg-gray-700 text-gray-400"}`}>
                            {meal.type}
                          </span>
                          <h4 className="text-white font-semibold mt-2">{meal.name}</h4>
                          {meal.quantity && (
                            <p className="text-gray-400 text-sm mt-0.5">📦 {meal.quantity}</p>
                          )}
                        </div>
                        <span className="text-white font-bold text-lg whitespace-nowrap">
                          {meal.calories} cal
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Protein", value: `${meal.protein}g`, color: "text-emerald-400" },
                          { label: "Carbs", value: `${meal.carbs}g`, color: "text-blue-400" },
                          { label: "Fat", value: `${meal.fat}g`, color: "text-orange-400" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-black/20 rounded-xl p-2 text-center">
                            <p className={`font-bold text-sm ${color}`}>{value}</p>
                            <p className="text-gray-500 text-xs">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}