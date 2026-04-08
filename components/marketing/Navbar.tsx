"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              FitAI<span className="text-emerald-400">Pro</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 py-4 rounded-b-2xl">

            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 px-4 pt-3 border-t border-gray-800 mt-2">
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300"
                >
                  Sign In
                </Button>
              </Link>

              <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Start Free</Button>
              </Link>
            </div>

          </div>
        )}
      </div>
    </nav>
  );
}