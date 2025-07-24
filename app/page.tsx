"use client";

import Link from "next/link";

export default function Home() {
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
      </header>
      {/* Spacer untuk konten tengah jika ingin menambah */}
      <div className="flex-1"></div>
    </div>
  );
}
