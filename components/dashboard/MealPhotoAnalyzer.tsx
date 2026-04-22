"use client";
import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Zap, Lock, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  const [foodHint, setFoodHint] = useState(""); // optional text hint
  const [caloriesLogged, setCaloriesLogged] = useState(0);
  const [canRetryWithText, setCanRetryWithText] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canUse = isPaid || isTrialActive;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setImageFile(file);
    setAnalysis(null);
    setCanRetryWithText(false);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (useTextOnly = false) => {
    if (!imageFile && !foodHint && !useTextOnly) { toast.error("Please upload a photo or type the food name"); return; }
    setAnalyzing(true);
    setCanRetryWithText(false);

    try {
      const formData = new FormData();
      if (imageFile && !useTextOnly) formData.append("image", imageFile);
      formData.append("mealType", mealType);
      if (foodHint) formData.append("foodHint", foodHint);

      const res = await fetch("/api/meal/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 403) { toast.error("Upgrade to access meal analysis"); return; }

      if (!data.success) {
        toast.error(data.message || "Could not identify food");
        if (data.canRetryWithText) setCanRetryWithText(true);
        return;
      }

      setAnalysis(data.analysis);
      setCaloriesLogged(data.caloriesLogged || 0);
      toast.success(`✅ ${data.caloriesLogged || "?"} calories logged!`);
    } catch {
      toast.error("Analysis failed. Check your connection.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null); setImageFile(null); setAnalysis(null);
    setFoodHint(""); setCanRetryWithText(false); setCaloriesLogged(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const healthColors: Record<string, string> = {
    excellent: "text-emerald-400", good: "text-blue-400",
    moderate: "text-amber-400", poor: "text-red-400",
  };

  if (!canUse) {
    return (
      <div className="bg-gray-900 border border-amber-500/20 rounded-2xl p-6 text-center">
        <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-white font-bold mb-2">📸 Meal Photo Calorie Analysis</h3>
        <p className="text-gray-400 text-sm mb-4">
          Snap a photo of any meal — AI identifies food and calculates exact calories
        </p>
        <a href="/pricing" className="bg-amber-500 text-black font-bold px-6 py-2.5 rounded-full text-sm hover:bg-amber-400 inline-block transition-colors">
          Unlock with Pro →
        </a>
      </div>
    );
  }

  if (analysis) {
    const hc = healthColors[analysis.healthRating] || "text-gray-400";
    const totalCal = Math.round((analysis.totalCalories.min + analysis.totalCalories.max) / 2);
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            📸 Meal Analysis
            <span className={`text-xs font-normal px-2 py-0.5 rounded-full border capitalize ${
              analysis.healthRating === "excellent" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
              analysis.healthRating === "good" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" :
              analysis.healthRating === "moderate" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
              "border-red-500/30 bg-red-500/10 text-red-400"
            }`}>
              {analysis.healthRating === "excellent" ? "⭐ Excellent" : analysis.healthRating === "good" ? "✅ Good" : analysis.healthRating === "moderate" ? "⚠️ Moderate" : "❌ Poor"}
            </span>
          </h3>
          <button onClick={reset} className="text-gray-500 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Image thumbnail */}
        {image && (
          <img src={image} alt="Meal" className="w-full h-40 object-cover rounded-xl" />
        )}

        {/* Total calories */}
        <div className="bg-gray-800/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-2xl">{totalCal} cal</span>
            <span className="text-gray-400 text-sm">{analysis.totalCalories.min}–{analysis.totalCalories.max} range</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Protein", value: `${analysis.totalProtein}g`, color: "text-emerald-400" },
              { label: "Carbs", value: `${analysis.totalCarbs}g`, color: "text-blue-400" },
              { label: "Fat", value: `${analysis.totalFat}g`, color: "text-orange-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-2 text-center">
                <p className={`font-bold text-sm ${color}`}>{value}</p>
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

        {/* AI note */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 text-xs font-bold mb-1">🤖 Nutritionist Says</p>
          <p className="text-gray-300 text-sm">{analysis.healthNote}</p>
          {analysis.suggestion && <p className="text-gray-400 text-xs mt-1.5">💡 {analysis.suggestion}</p>}
        </div>

        <p className="text-gray-600 text-xs text-center">✅ {caloriesLogged} calories logged to your daily tracker</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Meal Calorie Scanner</h3>
          <p className="text-gray-400 text-xs">Photo or type food name → AI calculates calories</p>
        </div>
        {isPaid && <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">Pro</span>}
      </div>

      {/* Meal type */}
      <div className="flex gap-2 flex-wrap">
        {["breakfast", "lunch", "snack", "dinner"].map((type) => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              mealType === type ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {type === "breakfast" ? "🌅" : type === "lunch" ? "☀️" : type === "snack" ? "🍎" : "🌙"} {type}
          </button>
        ))}
      </div>

      {/* Photo upload */}
      {!image ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors group"
        >
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-700 transition-colors">
            <Upload className="w-7 h-7 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-gray-300 font-medium text-sm">Take or upload a photo</p>
          <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP · Max 10MB</p>
        </button>
      ) : (
        <div className="relative">
          <img src={image} alt="Meal" className="w-full h-48 object-cover rounded-2xl" />
          <button
            onClick={() => { setImage(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Food name hint (always visible, optional) */}
      <div>
        <label className="block text-gray-400 text-xs font-medium mb-1.5">
          Food name hint <span className="text-gray-600">(optional — helps AI accuracy)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Aloo Paratha, Dal Rice, Chicken curry..."
          value={foodHint}
          onChange={(e) => setFoodHint(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
        />
        <p className="text-gray-600 text-xs mt-1">You can also just type the food name without uploading a photo</p>
      </div>

      {/* Retry with text if image analysis failed */}
      {canRetryWithText && foodHint && (
        <button
          onClick={() => analyzeImage(true)}
          className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-amber-500/30 transition-colors"
        >
          🔄 Estimate calories by food name instead
        </button>
      )}

      {/* Analyze button */}
      {(image || foodHint) && (
        <button
          onClick={() => analyzeImage()}
          disabled={analyzing}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
          ) : (
            <><Zap className="w-5 h-5" /> {image ? "Analyze Photo" : "Estimate Calories"}</>
          )}
        </button>
      )}
    </div>
  );
}