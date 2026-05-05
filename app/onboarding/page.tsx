"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronLeft, Dumbbell, Home, Building2,
  Sun, Moon, Sunrise, Clock
} from "lucide-react";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, title: "You are a...", subtitle: "Personalizes your entire plan" },
  { id: 2, title: "Your Goal", subtitle: "What do you want to achieve?" },
  { id: 3, title: "Body Details", subtitle: "For accurate calorie targets" },
  { id: 4, title: "Fitness Level", subtitle: "We'll match your starting point" },
  { id: 5, title: "Workout Setup", subtitle: "Where and when do you train?" },
  { id: 6, title: "Diet Preference", subtitle: "For your personalized meal plan" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    gender: "",
    goal: "",
    age: "",
    currentWeight: "",
    targetWeight: "",
    height: "",
    fitnessLevel: "",
    workoutType: "",
    preferredWorkoutTime: "", // morning | afternoon | evening | night | flexible
    workoutDaysPerWeek: "3",
    dailySteps: "5000",
    dietType: "",
    wakeTime: "",
    sleepTime: "",
  });

  const set = (key: string, val: string) => setData(d => ({ ...d, [key]: val }));

  const canProceed = () => {
    if (step === 1) return !!data.gender;
    if (step === 2) return !!data.goal;
    if (step === 3) return !!data.age && !!data.currentWeight && !!data.height;
    if (step === 4) return !!data.fitnessLevel;
    if (step === 5) return !!data.workoutType && !!data.preferredWorkoutTime;
    if (step === 6) return !!data.dietType;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, targetWeight: data.targetWeight || data.currentWeight }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Welcome to FitAI Pro! 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const OptionCard = ({
    selected, onClick, emoji, label, subtitle
  }: {
    selected: boolean; onClick: () => void;
    emoji?: string; label: string; subtitle?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
        selected
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-gray-800 bg-gray-900 hover:border-gray-600"
      }`}
    >
      {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {selected && <div className="ml-auto w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white text-xs">✓</span></div>}
    </button>
  );

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">⚡</span>
          </div>
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Step {step} of {STEPS.length}
          </p>
          <h1 className="text-2xl font-bold text-white">{STEPS[step - 1].title}</h1>
          <p className="text-gray-400 text-sm mt-1">{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-800 rounded-full h-1 mb-8">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* STEP 1 — Gender */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "male", emoji: "👨", label: "Male" },
              { id: "female", emoji: "👩", label: "Female" },
              { id: "other",  emoji: "🧑", label: "Other" },
            ].map(g => (
              <button
                key={g.id}
                onClick={() => set("gender", g.id)}
                className={`p-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  data.gender === g.id ? "border-emerald-500 bg-emerald-500/10" : "border-gray-800 bg-gray-900 hover:border-gray-600"
                }`}
              >
                <span className="text-5xl">{g.emoji}</span>
                <span className="text-white font-bold">{g.label}</span>
              </button>
            ))}
            <p className="col-span-2 text-center text-gray-600 text-xs">
              This helps calculate accurate calorie targets
            </p>
          </div>
        )}

        {/* STEP 2 — Goal */}
        {step === 2 && (
          <div className="space-y-3">
            {[
              { id: "lose_weight",       emoji: "🔥", label: "Lose Weight",         sub: "Burn fat, reduce weight safely" },
              { id: "build_muscle",      emoji: "💪", label: "Build Muscle",         sub: "Gain strength and muscle mass" },
              { id: "stay_fit",          emoji: "⚡", label: "Stay Fit",             sub: "Maintain fitness and energy" },
              { id: "improve_endurance", emoji: "🏃", label: "Improve Endurance",    sub: "Run longer, feel stronger" },
            ].map(g => (
              <OptionCard
                key={g.id}
                selected={data.goal === g.id}
                onClick={() => set("goal", g.id)}
                emoji={g.emoji}
                label={g.label}
                subtitle={g.sub}
              />
            ))}
          </div>
        )}

        {/* STEP 3 — Body Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400">
              💡 We use the Mifflin-St Jeor equation to calculate your exact calorie needs — industry gold standard.
            </div>
            {[
              { key: "age", label: "Age", placeholder: "25", unit: "years", type: "number", min: 13, max: 90 },
              { key: "height", label: "Height", placeholder: "170", unit: "cm", type: "number", min: 100, max: 250 },
              { key: "currentWeight", label: "Current Weight", placeholder: "70", unit: "kg", type: "number", min: 30, max: 300 },
              { key: "targetWeight", label: "Target Weight", placeholder: "65", unit: "kg", type: "number", min: 30, max: 300 },
            ].map(f => (
              <div key={f.key}>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">{f.label}</label>
                <div className="relative">
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={data[f.key as keyof typeof data]}
                    onChange={e => set(f.key, e.target.value)}
                    min={f.min}
                    max={f.max}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{f.unit}</span>
                </div>
              </div>
            ))}

            {/* Daily steps — optional */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Daily Steps <span className="text-gray-600">(approximate)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "2000", label: "< 2k", sub: "Very low" },
                  { val: "5000", label: "3–7k", sub: "Average" },
                  { val: "10000", label: "8k+", sub: "Active" },
                ].map(s => (
                  <button
                    key={s.val}
                    onClick={() => set("dailySteps", s.val)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      data.dailySteps === s.val ? "border-emerald-500 bg-emerald-500/10" : "border-gray-800 bg-gray-900 hover:border-gray-700"
                    }`}
                  >
                    <p className="text-white font-bold text-sm">{s.label}</p>
                    <p className="text-gray-500 text-xs">{s.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Fitness Level */}
        {step === 4 && (
          <div className="space-y-3">
            {[
              { id: "beginner",     emoji: "🌱", label: "Beginner",     sub: "Just getting started or returning after a gap" },
              { id: "intermediate", emoji: "💪", label: "Intermediate", sub: "Training regularly for 6+ months" },
              { id: "advanced",     emoji: "🔥", label: "Advanced",     sub: "Consistent training for 2+ years" },
            ].map(l => (
              <OptionCard key={l.id} selected={data.fitnessLevel === l.id} onClick={() => set("fitnessLevel", l.id)} emoji={l.emoji} label={l.label} subtitle={l.sub} />
            ))}

            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">How many days/week can you workout?</label>
              <div className="flex gap-2">
                {["2", "3", "4", "5", "6"].map(d => (
                  <button
                    key={d}
                    onClick={() => set("workoutDaysPerWeek", d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      data.workoutDaysPerWeek === d ? "bg-emerald-500 text-white" : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-1 text-center">days per week</p>
            </div>
          </div>
        )}

        {/* STEP 5 — Workout Setup */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Where will you workout?</label>
              <div className="space-y-2">
                {[
                  { id: "home_no_equipment", emoji: "🏠", label: "Home — No Equipment", sub: "Bodyweight only" },
                  { id: "home_with_equipment", emoji: "🏋️", label: "Home — With Equipment", sub: "Dumbbells, resistance bands" },
                  { id: "gym", emoji: "🏟️", label: "Gym", sub: "Full equipment access" },
                ].map(t => (
                  <OptionCard key={t.id} selected={data.workoutType === t.id} onClick={() => set("workoutType", t.id)} emoji={t.emoji} label={t.label} subtitle={t.sub} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">When do you prefer to workout?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "morning", emoji: "🌅", label: "Morning", sub: "5–9 AM" },
                  { id: "afternoon", emoji: "☀️", label: "Afternoon", sub: "12–4 PM" },
                  { id: "evening", emoji: "🌆", label: "Evening", sub: "5–8 PM" },
                  { id: "night", emoji: "🌙", label: "Night", sub: "9 PM–12 AM" },
                  { id: "flexible", emoji: "🔄", label: "Flexible", sub: "Any time works" },
                  { id: "multiple", emoji: "⚡", label: "Multiple/Day", sub: "AM + PM sessions" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => set("preferredWorkoutTime", t.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      data.preferredWorkoutTime === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-gray-800 bg-gray-900 hover:border-gray-700"
                    }`}
                  >
                    <span className="text-xl block mb-1">{t.emoji}</span>
                    <p className="text-white font-semibold text-xs">{t.label}</p>
                    <p className="text-gray-500 text-xs">{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional wake/sleep times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Wake time (optional)</label>
                <input
                  type="time"
                  value={data.wakeTime}
                  onChange={e => set("wakeTime", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Sleep time (optional)</label>
                <input
                  type="time"
                  value={data.sleepTime}
                  onChange={e => set("sleepTime", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — Diet */}
        {step === 6 && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
              <p className="text-emerald-400 text-sm font-medium">🎁 Free 7-day personalized Indian meal plan included!</p>
            </div>
            {[
              { id: "vegetarian",     emoji: "🥗", label: "Vegetarian",     sub: "Dal, paneer, eggs, curd" },
              { id: "non_vegetarian", emoji: "🍗", label: "Non-Vegetarian",  sub: "Chicken, fish, eggs + veg" },
              { id: "vegan",          emoji: "🌱", label: "Vegan",           sub: "No dairy, no eggs, no meat" },
              { id: "no_preference",  emoji: "🍽️", label: "No Preference",   sub: "Whatever is healthy" },
            ].map(d => (
              <OptionCard key={d.id} selected={data.dietType === d.id} onClick={() => set("dietType", d.id)} emoji={d.emoji} label={d.label} subtitle={d.sub} />
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < STEPS.length ? (
            <button
              onClick={() => canProceed() && setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-40"
            >
              {loading ? "Setting up your plan..." : "Start My Journey 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}