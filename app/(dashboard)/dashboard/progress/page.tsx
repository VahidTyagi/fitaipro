"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Scale, Plus, Check, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface Stats {
  progressData: { date: string; weight: number | null; bodyFat: number | null }[];
  weeklyData: { day: string; workouts: number; calories: number }[];
  currentWeight: number | null;
  targetWeight: number | null;
}

export default function ProgressPage() {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setStatsLoading(false); })
      .catch(() => setStatsLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!weight) { toast.error("Please enter your weight"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          bodyFat: bodyFat ? parseFloat(bodyFat) : null,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Progress logged! 🎉");
      setLogged(true);
      setWeight(""); setBodyFat(""); setNotes("");
      setTimeout(() => {
        setLogged(false);
        fetch("/api/stats").then((r) => r.json()).then(setStats);
      }, 2000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const weightToGoal = stats?.currentWeight && stats?.targetWeight
    ? Math.abs(stats.currentWeight - stats.targetWeight).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Progress Tracker</h1>
        <p className="text-gray-400">Track your transformation over time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Notes <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="How are you feeling today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || logged}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {logged ? <><Check className="w-5 h-5" /> Logged!</> : loading ? "Saving..." : "Log Progress"}
            </button>
          </div>
        </div>

        {/* Goal Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
          <h2 className="text-white font-bold text-lg mb-4">Weight Goal</h2>
          {stats?.currentWeight && stats?.targetWeight ? (
            <>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Current</p>
                  <p className="text-4xl font-extrabold text-white">{stats.currentWeight}<span className="text-lg text-gray-400 ml-1">kg</span></p>
                </div>
                <div className="text-gray-600 text-2xl">→</div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs mb-1">Target</p>
                  <p className="text-4xl font-extrabold text-emerald-400">{stats.targetWeight}<span className="text-lg text-emerald-600 ml-1">kg</span></p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">
                  <span className="text-white font-bold text-lg">{weightToGoal}kg</span> to go
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center">Set your target weight in onboarding to see goal tracking</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          Weekly Activity
        </h2>
        {statsLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats?.weeklyData && stats.weeklyData.some((d) => d.workouts > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", color: "#fff" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Bar dataKey="workouts" fill="#10b981" radius={[6, 6, 0, 0]} name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Complete workouts to see activity</p>
            </div>
          </div>
        )}
      </div>

      {/* Weight Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Weight Trend
        </h2>
        {stats?.progressData && stats.progressData.filter((d) => d.weight).length >= 2 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.progressData.filter((d) => d.weight)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", color: "#fff" }}
                formatter={(v: any) => [`${v} kg`, "Weight"]}
              />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Log weight at least twice to see trend</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}