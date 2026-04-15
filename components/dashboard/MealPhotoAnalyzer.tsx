"use client";
import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Zap, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: string;
}

interface Analysis {
  foodItems: FoodItem[];
  totalCalories: { min: number; max: number };
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  healthRating: string;
  healthNote: string;
  suggestion: string;
}

interface Props {
  isPaid: boolean;
  isTrialActive: boolean;
}

export default function MealPhotoAnalyzer({ isPaid, isTrialActive }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mealType, setMealType] = useState("breakfast");
  const fileRef = useRef<HTMLInputElement>(null);

  const canUse = isPaid || isTrialActive;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setAnalysis(null);
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("mealType", mealType);

      const res = await fetch("/api/meal/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 403) {
        toast.error("Upgrade to Pro to use meal analysis");
        return;
      }

      if (!data.success) {
        toast.error(data.message || "Could not identify food");
        return;
      }

      setAnalysis(data.analysis);
      toast.success("Meal analyzed and logged! 🥗");
    } catch {
      toast.error("Analysis failed. Check your connection.");
    } finally {
      setAnalyzing(false);
    }
  };

  const healthColors = { excellent: "text-emerald-400", good: "text-blue-400", moderate: "text-amber-400", poor: "text-red-400" };
  const healthColor = healthColors[analysis?.healthRating as keyof typeof healthColors] || "text-gray-400";

  if (!canUse) {
    return (
      <div className="bg-gray-900 border border-amber-500/20 rounded-2xl p-6 text-center">
        <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-white font-bold mb-2">Meal Photo Analysis</h3>
        <p className="text-gray-400 text-sm mb-4">Snap a photo of your meal and AI will estimate calories automatically</p>
        <a href="/pricing" className="bg-amber-500 text-black font-bold px-5 py-2 rounded-full text-sm hover:bg-amber-400 transition-colors inline-block">
          Upgrade to Unlock
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Meal Photo Analysis</h3>
          <p className="text-gray-400 text-xs">Snap a photo → AI estimates calories instantly</p>
        </div>
        {isPaid && <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">Pro</span>}
      </div>

      {/* Meal Type */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["breakfast", "lunch", "snack", "dinner"].map((type) => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              mealType === type ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {!image ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors group"
        >
          <Upload className="w-10 h-10 text-gray-600 mx-auto mb-3 group-hover:text-emerald-400 transition-colors" />
          <p className="text-gray-400 text-sm font-medium">Tap to upload meal photo</p>
          <p className="text-gray-600 text-xs mt-1">JPG, PNG • Max 5MB</p>
        </button>
      ) : (
        <div className="relative mb-4">
          <img src={image} alt="Meal" className="w-full h-52 object-cover rounded-2xl" />
          <button
            onClick={() => { setImage(null); setImageFile(null); setAnalysis(null); }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />

      {image && !analysis && (
        <button
          onClick={analyzeImage}
          disabled={analyzing}
          className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
          ) : (
            <><Zap className="w-5 h-5" /> Analyze Calories</>
          )}
        </button>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="mt-4 space-y-4">
          {/* Calorie summary */}
          <div className="bg-gray-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-lg">
                {analysis.totalCalories.min}–{analysis.totalCalories.max} cal
              </span>
              <span className={`text-sm font-semibold capitalize ${healthColor}`}>
                {analysis.healthRating === "excellent" ? "⭐ Excellent" :
                 analysis.healthRating === "good" ? "✅ Good" :
                 analysis.healthRating === "moderate" ? "⚠️ Moderate" : "❌ Poor"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Protein", value: `${analysis.totalProtein}g`, color: "text-emerald-400" },
                { label: "Carbs", value: `${analysis.totalCarbs}g`, color: "text-blue-400" },
                { label: "Fat", value: `${analysis.totalFat}g`, color: "text-orange-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center bg-gray-800 rounded-xl p-2">
                  <p className={`font-bold ${color}`}>{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Food items */}
          <div className="space-y-2">
            {analysis.foodItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-gray-500 text-xs">{item.quantity}</p>
                </div>
                <span className="text-white font-bold text-sm">{item.calories} cal</span>
              </div>
            ))}
          </div>

          {/* Health note */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <p className="text-emerald-400 text-xs font-semibold mb-1">🤖 AI Nutritionist</p>
            <p className="text-gray-300 text-sm">{analysis.healthNote}</p>
            {analysis.suggestion && (
              <p className="text-gray-400 text-xs mt-2">💡 {analysis.suggestion}</p>
            )}
          </div>

          <p className="text-gray-600 text-xs text-center">✅ Logged to your daily nutrition tracker</p>

          <button
            onClick={() => { setImage(null); setImageFile(null); setAnalysis(null); }}
            className="w-full bg-gray-800 text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors"
          >
            Analyze Another Meal
          </button>
        </div>
      )}
    </div>
  );
}