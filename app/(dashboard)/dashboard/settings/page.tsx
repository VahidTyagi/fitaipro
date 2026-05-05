"use client";
import { useState, useEffect } from "react";
import {
  User, Save, CreditCard, FileText, AlertCircle,
  CheckCircle, LogOut, TrendingDown, X
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const [profile, setProfile] = useState({ name: "", email: "", plan: "free" });
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        const name = cleanName(d.name, d.email);
        setProfile({ name, email: d.email || "", plan: d.plan || "free" });
        setNewName(name);
      });
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then(setSubscription);
    fetch("/api/payment/history")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(() => {});
  }, []);

  function cleanName(name?: string | null, email?: string): string {
    if (name && !name.includes("@") && !name.includes("+")) return name;
    const local = (email || "").split("@")[0].split("+")[0];
    return local.replace(/[._-]/g, " ").split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  const saveName = async () => {
    if (!newName.trim() || newName.trim() === profile.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setProfile((p) => ({ ...p, name: newName.trim() }));
      toast.success("Name updated! ✅");
    } catch (e: any) {
      toast.error(e.message || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleCancelPlan = async () => {
    try {
      const res = await fetch("/api/payment/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Plan cancelled. You keep access until expiry.");
      setShowCancelConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Failed. Email fitaipro.official@gmail.com to cancel.");
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your profile and subscription</p>
      </div>

      {/* Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" /> Profile
        </h2>
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Display Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder="Your name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button
              onClick={saveName}
              disabled={saving || !newName.trim() || newName.trim() === profile.name}
              className="px-5 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 flex items-center gap-2 text-sm"
            >
              {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Email Address</label>
          <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
            <span className="text-gray-300 text-sm flex-1 truncate">{profile.email || "—"}</span>
            <span className="text-gray-600 text-xs flex-shrink-0">Managed by Clerk</span>
          </div>
        </div>
        {/* Sign out button — easily accessible */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Subscription */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" /> Subscription
        </h2>

        {subscription && (
          <div className={`rounded-xl p-4 border ${
            subscription.isPaid ? "bg-emerald-500/10 border-emerald-500/20" : "bg-gray-800 border-gray-700"
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white font-semibold capitalize">
                  {subscription.isPaid ? `${subscription.plan} Plan` : "Free Plan"}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {subscription.isPaid
                    ? `${subscription.daysLeft} days remaining${subscription.subscriptionEnd ? ` · Expires ${new Date(subscription.subscriptionEnd).toLocaleDateString("en-IN")}` : ""}`
                    : `${subscription.daysLeft} days left in free trial`}
                </p>
              </div>
              {!subscription.isPaid && (
                <Link href="/pricing" className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors">
                  Upgrade Now
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Plan management — Cancel / Downgrade */}
        {subscription?.isPaid && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm font-semibold">Plan Management</p>

            {/* Upgrade if on Pro */}
            {subscription.plan === "pro" && (
              <Link
                href="/pricing"
                className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-500/20 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-purple-400 rotate-180" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Upgrade to Elite</p>
                  <p className="text-gray-400 text-xs">Unlimited chat, video tracking, more features</p>
                </div>
              </Link>
            )}

            {/* Cancel plan */}
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex items-center gap-3 w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/20 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Cancel Subscription</p>
                <p className="text-gray-400 text-xs">
                  You keep access until {subscription.subscriptionEnd ? new Date(subscription.subscriptionEnd).toLocaleDateString("en-IN") : "expiry"}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Cancel confirmation modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold text-lg mb-2">Cancel Subscription?</h3>
              <p className="text-gray-400 text-sm mb-6">
                You will lose Pro features when your current period ends.
                Workouts remain free forever.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancelPlan}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-600 text-xs">
          Need help?{" "}
          <a href="mailto:fitaipro.official@gmail.com" className="text-emerald-400 hover:underline">
            fitaipro.official@gmail.com
          </a>
        </p>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Payment History
          </h2>
          {payments.map((p, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium capitalize">{p.plan} Plan</p>
                <p className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">₹{(p.amount / 100).toFixed(0)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700 text-gray-400"}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}