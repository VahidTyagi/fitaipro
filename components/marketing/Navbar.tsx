"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              FitAI<span className="text-emerald-500">Pro</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              Pricing
            </a>
          </div>

          {/* Desktop CTA — BOTH Sign In AND Sign Up */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-emerald-500 text-white font-semibold px-5 py-2 rounded-full text-sm hover:bg-emerald-600 transition-all shadow-sm"
            >
              Sign Up Free →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm font-medium py-2">Features</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm font-medium py-2">Pricing</a>
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="text-center text-gray-700 font-medium text-sm py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="text-center bg-emerald-500 text-white font-semibold text-sm py-2.5 rounded-full hover:bg-emerald-600 transition-colors">
              Sign Up Free →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}