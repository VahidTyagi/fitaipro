import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                FitAI<span className="text-emerald-500">Pro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered fitness coaching for everyone. Your goals. Your pace. Real results.
            </p>
            <p className="text-sm">Made with 💚 in India</p>
          </div>

          // Replace the Legal section in Footer.tsx
<div>
  <h4 className="text-white font-semibold mb-4">Legal</h4>
  <ul className="space-y-2 text-sm">
    <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
    <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
    <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
  </ul>
</div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About", "Blog", "Careers"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 FitAI Pro. All rights reserved.</p>
          <Link
            href="https://www.linkedin.com/company/fitai-pro"
            target="_blank"
            className="text-sm hover:text-white transition-colors"
          >
            LinkedIn →
          </Link>
        </div>
      </div>
    </footer>
  );
}