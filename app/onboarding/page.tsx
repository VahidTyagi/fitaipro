"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ChevronLeft, Dumbbell, Home, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const steps = [
  { id: 1, title: "Your Goal", subtitle: "What do you want to achieve?" },
  { id: 2, title: "Fitness Level", subtitle: "Where are you starting from?" },
  { id: 3, title: "Workout Type", subtitle: "Where will you train?" },
  { id: 4, title: "Your Details", subtitle: "Help us personalize your plan" },
  { id: 5, title: "Diet Preference", subtitle: "We'll tailor your free 7-day meal plan" },
];

const goals = [
  { id: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "stay_fit", label: "Stay Fit", emoji: "⚡" },
  { id: "improve_endurance", label: "Improve Endurance", emoji: "🏃" },
];

const levels = [
  { id: "beginner", label: "Beginner", desc: "Just getting started" },
  { id: "intermediate", label: "Intermediate", desc: "Training for 6+ months" },
  { id: "advanced", label: "Advanced", desc: "Training for 2+ years" },
];

const workoutTypes = [
  { id: "home_no_equipment", label: "Home Workout", desc: "No equipment needed", Icon: Home },
  { id: "home_with_equipment", label: "Home + Equipment", desc: "Dumbbells, resistance bands", Icon: Dumbbell },
  { id: "gym", label: "Gym Workout", desc: "Full gym access", Icon: Building2 },
];

const dietTypes = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "non_vegetarian", label: "Non-Vegetarian", emoji: "🍗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "no_preference", label: "No Preference", emoji: "🍽️" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    goal: "",
    fitnessLevel: "",
    workoutType: "",
    dietType: "",
    age: "",
    currentWeight: "",
    targetWeight: "",
    height: "",
  });

  const progress = (step / steps.length) * 100;

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return !!data.goal;
    if (step === 2) return !!data.fitnessLevel;
    if (step === 3) return !!data.workoutType;
    if (step === 4) return !!data.age && !!data.currentWeight && !!data.height;
    if (step === 5) return !!data.dietType;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Welcome to FitAI Pro! 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-emerald-400 text-sm font-medium mb-2">
            Step {step} of {steps.length}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            {steps[step - 1].title}
          </h1>
          <p className="text-gray-400">{steps[step - 1].subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-10">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {goals.map((g) => (
              <button
                key={g.id}
                onClick={() => setData({ ...data, goal: g.id })}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  data.goal === g.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
              >
                <span className="text-3xl mb-3 block">{g.emoji}</span>
                <span className="text-white font-semibold">{g.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Fitness Level */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => setData({ ...data, fitnessLevel: l.id })}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  data.fitnessLevel === l.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
              >
                <p className="text-white font-semibold">{l.label}</p>
                <p className="text-gray-400 text-sm">{l.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Workout Type */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {workoutTypes.map(({ id, label, desc, Icon }) => (
              <button
                key={id}
                onClick={() => setData({ ...data, workoutType: id })}
                className={`p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${
                  data.workoutType === id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">{label}</p>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4 — Body Details */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            {[
              { key: "age", label: "Age", placeholder: "e.g. 25", unit: "years" },
              { key: "height", label: "Height", placeholder: "e.g. 170", unit: "cm" },
              { key: "currentWeight", label: "Current Weight", placeholder: "e.g. 70", unit: "kg" },
              { key: "targetWeight", label: "Target Weight", placeholder: "e.g. 65", unit: "kg" },
            ].map(({ key, label, placeholder, unit }) => (
              <div key={key}>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={data[key as keyof typeof data]}
                    onChange={(e) => setData({ ...data, [key]: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5 — Diet */}
        {step === 5 && (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
              <p className="text-emerald-400 text-sm font-medium">
                🎁 You get a FREE 7-day personalized meal plan!
              </p>
              <p className="text-gray-400 text-xs mt-1">
                After 7 days, workouts stay free. Diet plans require a subscription.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {dietTypes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setData({ ...data, dietType: d.id })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    data.dietType === d.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-gray-800 bg-gray-900 hover:border-gray-700"
                  }`}
                >
                  <span className="text-3xl mb-3 block">{d.emoji}</span>
                  <span className="text-white font-semibold">{d.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10 gap-4">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < steps.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
            >
              {loading ? "Setting up your plan..." : "Start My Journey 🚀"}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}