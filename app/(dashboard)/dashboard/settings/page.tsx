"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { User, Mail, Save, CheckCircle, AlertCircle, Lock, CreditCard, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => {
        const displayName = getCleanName(d.name, d.email);
        setProfile({ name: displayName, email: d.email || "" });
        setNewName(displayName);
      });

    fetch("/api/user/plan")
      .then(r => r.json())
      .then(d => setSubscription(d));

    fetch("/api/payment/history")
      .then(r => r.json())
      .then(d => setPayments(d.payments || []))
      .catch(() => {});
  }, []);

  function getCleanName(name?: string | null, email?: string): string {
    if (name && !name.includes("@") && !name.includes("+")) return name;
    const local = (email || "").split("@")[0].split("+")[0];
    return local.replace(/[._-]/g, " ").split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  const saveName = async () => {
    if (!newName.trim()) { toast.error("Name cannot be empty"); return; }
    if (newName.trim() === profile.name) { toast("No changes made"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setProfile(p => ({ ...p, name: newName.trim() }));
      toast.success("Name updated! ✅");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
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

        {/* Name */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Display Name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Your name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button
              onClick={saveName}
              disabled={saving || newName.trim() === profile.name}
              className="px-5 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Email — show only, change via Clerk */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">Email Address</label>
          <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-gray-300 text-sm flex-1">{profile.email || "—"}</span>
            <span className="text-gray-600 text-xs">Managed by Clerk</span>
          </div>
          <p className="text-gray-600 text-xs mt-1.5">
            To change email, go to{" "}
            <button
              onClick={() => clerkUser?.update({ unsafeMetadata: {} })}
              className="text-emerald-400 hover:underline"
            >
              account settings
            </button>
          </p>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" /> Subscription
        </h2>

        {subscription && (
          <div className={`rounded-xl p-4 border ${
            subscription.isPaid
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-gray-800 border-gray-700"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold capitalize">
                  {subscription.isPaid ? `${subscription.plan} Plan` : "Free Trial"}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {subscription.isPaid
                    ? `${subscription.daysLeft} days remaining${subscription.subscriptionEnd ? ` · Renews ${new Date(subscription.subscriptionEnd).toLocaleDateString("en-IN")}` : ""}`
                    : `${subscription.daysLeft} days left in free trial`}
                </p>
              </div>
              {subscription.isPaid
                ? <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">Active</span>
                : <Link href="/pricing" className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-emerald-600 transition-colors">Upgrade</Link>
              }
            </div>
          </div>
        )}

        {subscription?.isPaid && (
          <p className="text-gray-500 text-xs">
            To cancel subscription, email:{" "}
            <a href="mailto:fitaipro.official@gmail.com" className="text-emerald-400 hover:underline">
              fitaipro.official@gmail.com
            </a>
          </p>
        )}
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Payment History
          </h2>
          <div className="space-y-2">
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
        </div>
      )}

      {/* Support */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" /> Support
        </h2>
        <p className="text-gray-400 text-sm">
          Need help? Email us at{" "}
          <a href="mailto:fitaipro.official@gmail.com" className="text-emerald-400 hover:underline">
            fitaipro.official@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}