"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import type { DbUser } from "@/types";

interface Props {
  user: DbUser;
  trialActive: boolean;
  daysLeft: number;
}

export default function DashboardHeader({ user, trialActive, daysLeft }: Props) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between md:ml-0 ml-12">
      <div>
        <h1 className="text-white font-bold text-lg hidden md:block">
          Welcome back, {user.name?.split(" ")[0] || "there"} 👋
        </h1>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Trial Badge */}
        {trialActive && (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} free left
            </span>
          </div>
        )}

        {/* {!trialActive && (
          <Link
            href="/pricing"
            className="hidden sm:block bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Upgrade Now
          </Link>
        )} */}


{trialActive && daysLeft <= 3 && (
  <Link
    href="/pricing"
    className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 hover:bg-amber-500/20 transition-colors"
  >
    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
    <span className="text-amber-400 text-xs font-medium">
      {daysLeft}d left — Upgrade
    </span>
  </Link>
)}

        {/* Notification Bell */}
        <button className="w-9 h-9 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}