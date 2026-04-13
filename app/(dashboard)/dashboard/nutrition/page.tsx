"use client";
import { useState, useEffect } from "react";
import { Lock, RefreshCw, Apple, Flame, Zap, Droplets } from "lucide-react";
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
  days: Day[];
}

const mealColors: Record<string, string> = {
  Breakfast: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  Lunch: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  Snack: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  Dinner: "bg-purple-500/20 text-purple-400 border-purple-500/20",
};

export default function NutritionPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [trialActive, setTrialActive] = useState(true);
  const [daysLeft, setDaysLeft] = useState(7);
  const [selectedDay, setSelectedDay] = useState(1);
  const [checked, setChecked] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

 // Replace the useEffect and trial banner with this:
useEffect(() => {
  fetch("/api/user/plan")
    .then((r) => r.json())
    .then((data) => {
      setTrialActive(data.trialActive);
      setDaysLeft(data.daysLeft);
      setIsPaid(data.isPaid);
      setChecked(true);
    })
    .catch(() => setChecked(true));
}, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/nutrition/generate", { method: "POST" });

      if (res.status === 403) {
        setTrialActive(false);
        toast.error("Trial expired. Please upgrade.");
        return;
      }

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setMealPlan(data.mealPlan);
      toast.success("AI meal plan generated! 🥗");
    } catch {
      toast.error("Failed to generate. Check API connection.");
    } finally {
      setGenerating(false);
    }
  };

  if (!trialActive) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-3">Diet Plans Locked</h1>
        <p className="text-gray-400 mb-8">
          Your 7-day free trial has ended. Workouts are still free forever. Upgrade to continue getting AI-powered Indian meal plans.
        </p>
        <Link
          href="/pricing"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all inline-block"
        >
          Upgrade Now →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Nutrition Plan</h1>
          <p className="text-gray-400">Personalized Indian meal plan based on your goals</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
        >
          {generating ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Zap className="w-4 h-4" /> {mealPlan ? "Regenerate Plan" : "Generate My Plan"}</>
          )}
        </button>
      </div>

      {/* Trial Banner */}
      {trialActive && (
  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
    <p className="text-emerald-400 text-sm font-medium">
      {isPaid
        ? `✅ Pro Plan Active — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
        : `🎁 Free trial — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left. Upgrade to keep diet plans after trial.`}
    </p>
    {!isPaid && (
      <Link href="/pricing" className="text-emerald-400 text-xs hover:text-emerald-300 underline">
        Upgrade →
      </Link>
    )}
  </div>
)}

      {/* Empty State */}
      {!mealPlan && !generating && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Apple className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">No meal plan yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Click &quot;Generate My Plan&quot; to get a personalized 7-day Indian meal plan based on your goal, diet preference, and body data.
          </p>
          <button
            onClick={generatePlan}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Generate My Plan 🥗
          </button>
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">AI is building your meal plan...</h2>
          <p className="text-gray-400">Creating 7 days of personalized Indian meals</p>
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
          {/* Summary */}
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

          {/* Day Selector */}
          <div className="flex gap-2 flex-wrap">
            {mealPlan.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDay === day.day
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {/* Selected Day */}
          {(() => {
            const day = mealPlan.days.find((d) => d.day === selectedDay);
            if (!day) return null;

            return (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-xl">Day {day.day}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Total: <span className="text-white font-bold">{day.totalCalories} cal</span>
                    </span>
                    <span className="text-gray-400">
                      Protein: <span className="text-emerald-400 font-bold">{day.totalProtein}g</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {day.meals.map((meal, i) => (
                    <div key={i} className={`border rounded-2xl p-5 ${mealColors[meal.type] || "bg-gray-800/50 border-gray-700"}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${mealColors[meal.type]?.split(" ")[1] || "text-gray-400"}`}>
                            {meal.type}
                          </span>
                          <h4 className="text-white font-semibold mt-1">{meal.name}</h4>
                          {meal.quantity && (
                            <p className="text-gray-400 text-sm">{meal.quantity}</p>
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