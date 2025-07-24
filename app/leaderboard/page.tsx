"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Dummy user (tidak masuk top 50)
const user = {
  rank: 123,
  avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=You",
  username: "You",
  points: 222,
};

interface LeaderboardItem {
  rank: number;
  avatar: string;
  username: string;
  points: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    const data = Array.from({ length: 50 }, (_, i) => ({
      rank: i + 1,
      avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=User${i + 1}`,
      username: `User${i + 1}`,
      points: Math.floor(Math.random() * 1000) + 100,
    }));
    setLeaderboard(data);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400 px-2 pt-8 pb-24">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Leaderboard</h1>
      <p className="text-blue-700 text-base mb-4 text-center max-w-xs">Top 50 players with the highest points.</p>

      {/* User sendiri */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/90 rounded-xl shadow border-2 border-blue-400">
          <span className="text-lg font-bold text-blue-700 w-8 text-center">{user.rank}</span>
          <Image
            src={user.avatar}
            alt="avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-blue-300 bg-white"
          />
          <span className="font-semibold text-blue-800 flex-1 truncate">{user.username} <span className="text-xs text-blue-400">(You)</span></span>
          <span className="font-bold text-blue-700 text-lg">{user.points}</span>
        </div>
      </div>

      {/* Leaderboard utama */}
      <div className="w-full max-w-sm bg-white/80 rounded-xl shadow border border-blue-200 overflow-hidden" style={{ maxHeight: "308px" }}>
        <div className="flex px-4 py-2 bg-blue-100 border-b border-blue-200 text-blue-700 font-bold text-sm">
          <span className="w-8 text-center">#</span>
          <span className="w-12"></span>
          <span className="flex-1">Username</span>
          <span className="w-16 text-right">Points</span>
        </div>
        <div className="overflow-y-auto divide-y divide-blue-100" style={{ maxHeight: "288px" }}>
          {leaderboard.map((item) => (
            <div key={item.rank} className="flex items-center px-4 py-2 hover:bg-blue-50 transition">
              <span className="w-8 text-center font-bold text-blue-500">{item.rank}</span>
              <Image
                src={item.avatar}
                alt="avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-blue-200 bg-white"
              />
              <span className="flex-1 ml-3 font-medium text-blue-800 truncate">{item.username}</span>
              <span className="w-16 text-right font-semibold text-blue-700">{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 