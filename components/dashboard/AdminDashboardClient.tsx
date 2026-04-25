"use client";
import { useState } from "react";
import {
  Users, TrendingUp, CreditCard, Search,
  ChevronDown, ChevronUp, Shield, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  subscriptionStatus: string | null;
  subscriptionEnd: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
  onboardingDone: boolean;
  goal: string | null;
  gender: string | null;
  currentWeight: number | null;
  targetWeight: number | null;
  workouts: { id: string }[];
  payments: { id: string; amount: number }[];
}

interface Stats {
  totalUsers: number;
  paidUsers: number;
  freeTrialUsers: number;
  totalRevenue: number;
}

export default function AdminDashboardClient({ users, stats }: { users: User[]; stats: Stats }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | paid | free | trial
  const [sortBy, setSortBy] = useState("newest");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) && !(u.name || "").toLowerCase().includes(q)) return false;
      if (filter === "paid") return u.plan === "pro" || u.plan === "elite";
      if (filter === "free") return u.plan === "free";
      if (filter === "trial") {
        const trialEnd = u.trialEnd ? new Date(u.trialEnd) : null;
        return u.plan === "free" && trialEnd && trialEnd > new Date();
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "plan") return b.plan.localeCompare(a.plan);
      return 0;
    });

  const extendTrial = async (userId: string, days: number) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "extend_trial", days }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Trial extended by ${days} days`);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdatingUser(null);
    }
  };

  const setUserPlan = async (userId: string, plan: string) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "set_plan", plan }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Plan updated to ${plan}`);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage all users and subscriptions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
          { label: "Paid Users", value: stats.paidUsers, icon: CreditCard, color: "text-emerald-400" },
          { label: "Trial Users", value: stats.freeTrialUsers, icon: TrendingUp, color: "text-amber-400" },
          { label: "Revenue", value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, icon: TrendingUp, color: "text-purple-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className={`font-bold text-xl ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {["all", "paid", "trial", "free"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                filter === f ? "bg-emerald-500 text-white" : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="plan">By plan</option>
        </select>
      </div>

      {/* User count */}
      <p className="text-gray-500 text-sm">{filtered.length} users found</p>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map(user => {
          const isExpanded = expandedUser === user.id;
          const trialEnd = user.trialEnd ? new Date(user.trialEnd) : null;
          const subEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : null;
          const isPaid = (user.plan === "pro" || user.plan === "elite") &&
            user.subscriptionStatus === "active" && subEnd && subEnd > new Date();

          const daysLeft = isPaid && subEnd
            ? Math.max(0, Math.ceil((subEnd.getTime() - Date.now()) / 86400000))
            : trialEnd
            ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000))
            : 0;

          return (
            <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold text-sm truncate">
                      {user.name || "—"}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                      isPaid ? "bg-emerald-500/20 text-emerald-400" :
                      daysLeft > 0 ? "bg-amber-500/20 text-amber-400" :
                      "bg-gray-700 text-gray-400"
                    }`}>
                      {isPaid ? `${user.plan} · ${daysLeft}d left` :
                       daysLeft > 0 ? `Trial · ${daysLeft}d` : "Expired"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
                  <div>
                    <p className="text-white font-bold text-sm">{user.workouts.length}</p>
                    <p className="text-gray-600 text-xs">workouts</p>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{user.payments.length}</p>
                    <p className="text-gray-600 text-xs">payments</p>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <p className="text-gray-600 text-xs">joined</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Goal", value: (user.goal || "—").replace(/_/g, " ") },
                      { label: "Gender", value: user.gender || "—" },
                      { label: "Weight", value: user.currentWeight ? `${user.currentWeight}kg → ${user.targetWeight || "?"}kg` : "—" },
                      { label: "Onboarding", value: user.onboardingDone ? "✅ Done" : "❌ Pending" },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-800/50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs">{label}</p>
                        <p className="text-white text-sm font-medium capitalize">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Admin Actions */}
                  <div className="flex flex-wrap gap-2">
                    <p className="text-gray-400 text-xs w-full font-semibold">Admin Actions:</p>
                    {["7", "14", "30"].map(d => (
                      <button
                        key={d}
                        onClick={() => extendTrial(user.id, parseInt(d))}
                        disabled={updatingUser === user.id}
                        className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                      >
                        {updatingUser === user.id ? <RefreshCw className="w-3 h-3 animate-spin inline" /> : `+${d}d trial`}
                      </button>
                    ))}
                    {["free", "pro", "elite"].map(plan => (
                      <button
                        key={plan}
                        onClick={() => setUserPlan(user.id, plan)}
                        disabled={updatingUser === user.id || user.plan === plan}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40 capitalize ${
                          user.plan === plan
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}