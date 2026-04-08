import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold mb-4">Dashboard 🚀</h1>
        <p className="text-gray-400 mb-6">Full dashboard coming in Day 4</p>
        <Link href="/" className="text-emerald-400 hover:text-emerald-300">
          ← Back Home
        </Link>
      </div>
    </div>
  );
}