"use client";
import { useUser } from "@/app/components/UserContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface LeaderboardUser {
  id: string;
  username: string | null;
  wallet_address: string;
  total_points: number;
  farcaster_profile?: {
    username: string;
    displayName: string;
    avatar: string;
  } | null;
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
        .select("id, username, wallet_address, total_points")
        .order("total_points", { ascending: false })
        .limit(50);
      setLeaderboard(topUsers || []);
      // Cari ranking user sendiri
      if (user) {
        // Query rank user sendiri
        const { data: allUsers } = await supabase
          .from("users")
          .select("id")
          .order("total_points", { ascending: false });
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
        username: user.username ?? user.wallet_address,
        wallet_address: user.wallet_address,
        total_points: user.total_points,
        farcaster_profile: user.farcaster_profile ? {
          username: user.farcaster_profile.username,
          displayName: user.farcaster_profile.displayName,
          avatar: user.farcaster_profile.avatar,
        } : null,
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
            <div className="flex items-center gap-2 flex-1">
              {userSelf.farcaster_profile?.avatar && (
                <Image 
                  src={userSelf.farcaster_profile.avatar} 
                  alt="Profile" 
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="truncate">
                {userSelf.farcaster_profile?.displayName || userSelf.username || userSelf.wallet_address}
              </span>
            </div>
            <span className="font-mono">{userSelf.total_points}</span>
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
                <div className="flex items-center gap-2 flex-1">
                  {u.farcaster_profile?.avatar && (
                    <Image 
                      src={u.farcaster_profile.avatar} 
                      alt="Profile" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="truncate">
                    {u.farcaster_profile?.displayName || u.username || u.wallet_address}
                  </span>
                </div>
                <span className="font-mono">{u.total_points}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 