"use client";
import { useUser } from "@/app/components/UserContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LeaderboardUser {
  id: string;
  username: string | null;
  wallet: string;
  point: number;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      // Ambil top 50
      const { data: topUsers } = await supabase
        .from("users")
        .select("id, username, wallet, point")
        .order("point", { ascending: false })
        .limit(50);
      setLeaderboard(topUsers || []);
      // Cari ranking user sendiri
      if (user) {
        // Query rank user sendiri
        const { data: allUsers } = await supabase
          .from("users")
          .select("id")
          .order("point", { ascending: false });
        const rank = allUsers?.findIndex((u) => u.id === user.id);
        setUserRank(rank !== undefined && rank >= 0 ? rank + 1 : null);
      } else {
        setUserRank(null);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, [user]);

  // User sendiri (dari context)
  const userSelf: LeaderboardUser | null = user
    ? {
        id: user.id,
        username: user.username ?? user.wallet,
        wallet: user.wallet,
        point: user.point,
      }
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-2 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Leaderboard</h1>
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-lg p-4">
        {/* User sendiri di paling atas */}
        {userSelf && (
          <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-blue-100 border-2 border-blue-400 font-bold text-blue-900">
            <span className="w-8 text-center">{userRank ?? '-'}</span>
            <span className="flex-1 truncate">{userSelf.username || userSelf.wallet}</span>
            <span className="font-mono">{userSelf.point}</span>
            <span className="ml-2 text-xs text-blue-500">(You)</span>
          </div>
        )}
        {/* Box leaderboard dengan scroll */}
        <div className="max-h-96 overflow-y-auto divide-y divide-blue-100">
          {loading ? (
            <div className="text-center py-8 text-blue-400">Loading...</div>
          ) : (
            leaderboard.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 p-3 ${u.id === userSelf?.id ? "bg-blue-50 font-bold text-blue-700" : ""}`}
              >
                <span className="w-8 text-center">{i + 1}</span>
                <span className="flex-1 truncate">{u.username || u.wallet}</span>
                <span className="font-mono">{u.point}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 