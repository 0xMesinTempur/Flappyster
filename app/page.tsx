"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Play", icon: "▶️", href: "/flappyster" },
  { label: "Daily Check-In", icon: "🎁", href: "/daily" },
  { label: "Leaderboard", icon: "🏆", href: "/leaderboard" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Play");
  const [points, setPoints] = useState(0);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-blue-200 to-blue-400">
      {/* Bagian Atas */}
      <header className="flex flex-col items-center pt-10 pb-6">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-4 drop-shadow">Flappyster</h1>
        <div className="flex gap-4 mb-6">
          <button className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition">Connect Wallet</button>
          <Link href="/flappyster">
            <button className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg shadow-lg text-lg hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300">Play</button>
          </Link>
        </div>
        <div className="bg-white/80 px-6 py-2 rounded-full shadow text-blue-800 font-medium text-lg">Poin: {points}</div>
      </header>

      {/* Spacer untuk konten tengah jika ingin menambah */}
      <div className="flex-1"></div>

      {/* Navigasi Bawah */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 border-t border-blue-200 flex justify-around items-center py-2 shadow-lg z-50 backdrop-blur-md">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center flex-1" onClick={() => setActiveTab(item.label)}>
            <span className={`text-2xl mb-1 transition ${activeTab === item.label ? "text-blue-600 scale-110" : "text-blue-400"}`}>{item.icon}</span>
            <span className={`text-xs font-semibold transition ${activeTab === item.label ? "text-blue-700" : "text-blue-400"}`}>{item.label}</span>
            {activeTab === item.label && <span className="w-2 h-2 bg-blue-400 rounded-full mt-1"></span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
