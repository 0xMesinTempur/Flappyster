"use client";
import { useUser } from "@/app/components/UserContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getFarcasterProfileByWallet } from "@/lib/farcasterAuth";
import Image from "next/image";
import { Trophy, Medal, Crown, Star } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError(null);
      
      try {
        // Ambil top 50 users dari Supabase menggunakan total_points
        const { data: topUsers, error: leaderboardError } = await supabase
          .from("users")
          .select("id, username, wallet_address, total_points")
          .order("total_points", { ascending: false })
          .limit(50);

        if (leaderboardError) {
          setError('Failed to load leaderboard');
          setLoading(false);
          return;
        }

        if (!topUsers) {
          setLeaderboard([]);
          setLoading(false);
          return;
        }

        // Fetch Farcaster profiles untuk setiap user
        const usersWithProfiles = await Promise.all(
          topUsers.map(async (userData) => {
            try {
              const farcasterProfile = await getFarcasterProfileByWallet(userData.wallet_address);
              return {
                ...userData,
                farcaster_profile: farcasterProfile ? {
                  username: farcasterProfile.username,
                  displayName: farcasterProfile.displayName,
                  avatar: farcasterProfile.avatar,
                } : null,
              };
            } catch {
              return {
                ...userData,
                farcaster_profile: null,
              };
            }
          })
        );

        setLeaderboard(usersWithProfiles);

        // Cari ranking user sendiri
        if (user) {
          try {
            const { data: allUsers, error: rankError } = await supabase
              .from("users")
              .select("id")
              .order("total_points", { ascending: false });

            if (!rankError && allUsers) {
              const rank = allUsers.findIndex((u) => u.id === user.id);
              setUserRank(rank !== undefined && rank >= 0 ? rank + 1 : null);
            }
          } catch {
            // Silent error handling
          }
        } else {
          setUserRank(null);
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [user]);

  // User sendiri (dari context)
  const userSelf: LeaderboardUser | null = user
    ? {
        id: user.id,
        username: user.username ?? user.wallet_address,
        wallet_address: user.wallet_address,
        total_points: user.total_points || 0,
        farcaster_profile: user.farcaster_profile ? {
          username: user.farcaster_profile.username,
          displayName: user.farcaster_profile.displayName,
          avatar: user.farcaster_profile.avatar,
        } : null,
      }
    : null;

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Star className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Leaderboard
            </h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-blue-100 text-lg">Top Players of Flappyster</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-300/30 rounded-lg px-4 py-3">
              <div className="text-red-100 font-medium">Error</div>
              <div className="text-red-200 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* User's Current Rank */}
        {userSelf && userRank && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="font-bold text-lg">{userRank}</span>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {userSelf.farcaster_profile?.displayName || userSelf.username || "Anonymous"}
                    </div>
                    <div className="text-sm opacity-90">
                      @{userSelf.farcaster_profile?.username || "user"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userSelf.total_points}</div>
                  <div className="text-sm opacity-90">points</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center justify-between font-semibold">
                <span>Rank</span>
                <span>Player</span>
                <span>Points</span>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-white">Loading leaderboard...</span>
                </div>
              ) : (
                leaderboard.map((u, i) => {
                  const rank = i + 1;
                  const isCurrentUser = u.id === userSelf?.id;
                  
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-4 px-6 py-4 border-b border-white/20 hover:bg-white/10 transition-all duration-200 ${
                        isCurrentUser ? 'bg-blue-500/20 border-l-4 border-l-blue-400' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center gap-2 w-12">
                        {rank <= 3 ? (
                          getRankIcon(rank)
                        ) : (
                          <span className="text-white font-semibold">{rank}</span>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex items-center gap-3 flex-1">
                        {u.farcaster_profile?.avatar ? (
                          <Image 
                            src={u.farcaster_profile.avatar} 
                            alt="Profile" 
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {u.farcaster_profile?.displayName?.charAt(0) || u.username?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {u.farcaster_profile?.displayName || u.username || "Anonymous"}
                          </div>
                          <div className="text-sm text-blue-100 truncate">
                            @{u.farcaster_profile?.username || "user"}
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="font-bold text-lg text-white">
                          {u.total_points.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-100">points</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/10 px-6 py-3 text-center">
              <p className="text-sm text-blue-100">
                Showing top {leaderboard.length} players
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && !error && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
            <p className="text-blue-100">Be the first to play and claim the top spot!</p>
          </div>
        )}
      </div>
    </div>
  );
} 