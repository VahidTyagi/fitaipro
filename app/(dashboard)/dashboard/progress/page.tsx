"use client";
import { useState } from "react";
import { TrendingUp, Scale, Plus, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ProgressPage() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  const handleSubmit = async () => {
    if (!weight) { toast.error("Please enter your weight"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight), bodyFat: bodyFat ? parseFloat(bodyFat) : null, notes }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Progress logged! 🎉");
      setLogged(true);
      setWeight(""); setBodyFat(""); setNotes("");
      setTimeout(() => setLogged(false), 3000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Track Progress</h1>
        <p className="text-gray-400">Log your body stats to see your transformation over time</p>
      </div>

      {/* Log Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Log Today&apos;s Stats
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Weight (kg) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Body Fat % <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 18"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Notes <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="How are you feeling? Any observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || logged}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {logged ? (
              <><Check className="w-5 h-5" /> Logged!</>
            ) : loading ? (
              "Saving..."
            ) : (
              "Log Progress"
            )}
          </button>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Progress Chart
        </h2>
        <p className="text-gray-500 text-sm mb-6">Your weight trend will appear here after logging</p>
        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Chart coming in Day 7</p>
          </div>
        </div>
      </div>
    </div>
  );
}