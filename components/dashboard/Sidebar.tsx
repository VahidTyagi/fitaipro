"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  History,
  MessageCircle,
  Sparkles,
  Shield,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs"; // ✅ updated
import { cn } from "@/lib/utils";
import type { DbUser } from "@/types";

// ✅ Nav items outside
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/dashboard/workout", icon: Dumbbell },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Nutrition", href: "/dashboard/nutrition", icon: Apple },
  {
    href: "/dashboard/custom-plan",
    label: "Custom Plan",
    icon: Sparkles,
    badge: "Pro",
    badgeColor: "bg-amber-500/20 text-amber-400",
  },
  { label: "AI Coach", href: "/dashboard/chat", icon: MessageCircle },
  { label: "Progress", href: "/dashboard/progress", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ user }: { user: DbUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.email === "vahidtyagi007@gmail.com";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            FitAI<span className="text-emerald-400">Pro</span>
          </span>
        </Link>
      </div>

      {/* User info (TOP) */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">
                {user.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user.name || "User"}
            </p>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Admin */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              pathname === "/dashboard/admin"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <Shield className="w-5 h-5" />
            Admin
          </Link>
        )}
      </nav>

      {/* ✅ Bottom Sticky Section (BEST PRACTICE) */}
      <div className="mt-auto border-t border-gray-800 p-4">
        <SignOutButton>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}