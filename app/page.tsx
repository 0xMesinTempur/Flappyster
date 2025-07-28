"use client";

import Link from "next/link";
import { FaCoins } from "react-icons/fa";
import { Wallet, User } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { useUser } from "@/app/components/UserContext";
import FarcasterProfileDisplay from "@/app/components/FarcasterProfile";
import ErrorMessage from "@/app/components/ErrorMessage";
import Image from "next/image";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, loading, error, fetchOrCreateUser } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-fetch user profile when wallet connects
  useEffect(() => {
    if (isConnected && address && !user?.farcaster_profile) {
      fetchOrCreateUser(address);
    }
  }, [isConnected, address, user?.farcaster_profile, fetchOrCreateUser]);

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      // Auto connect to Farcaster wallet
      if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    }
  };

  // Get display text for wallet button
  const getWalletButtonText = () => {
    if (!isConnected) {
      return isPending ? "Connecting..." : "Connect Wallet";
    }
    
    // If user has Farcaster profile, show username
    if (user?.farcaster_profile?.username) {
      return `@${user.farcaster_profile.username} (Disconnect)`;
    }
    
    // If user has display name, show that
    if (user?.farcaster_profile?.displayName) {
      return `${user.farcaster_profile.displayName} (Disconnect)`;
    }
    
    // Fallback to wallet address
    return `${address?.slice(0, 6)}...${address?.slice(-4)} (Disconnect)`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Profile Section */}
      <div className="flex justify-end items-center px-4 py-4">
        {/* Right side - Profile Section */}
        {isClient && isConnected && user && (
          <div className="flex items-center gap-3">
            {/* Points Display */}
            <div className="flex items-center bg-white/20 rounded-xl px-3 py-2 shadow-lg backdrop-blur border border-white/30">
              <FaCoins className="text-yellow-400 mr-2" size={16} />
              <span className="text-white font-bold">
                {loading ? "..." : user?.total_points ?? 0}
              </span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2 shadow-lg backdrop-blur border border-white/30">
              {user.farcaster_profile?.avatar ? (
                <Image 
                  src={user.farcaster_profile.avatar} 
                  alt="Profile" 
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
              )}
              <span className="text-white text-sm font-medium">
                {user.farcaster_profile?.displayName || 
                 user.farcaster_profile?.username ? `@${user.farcaster_profile.username}` : 
                 `${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full px-4 flex-1">
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto pt-8">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg text-center mb-6 mt-2 animate-glow">Flappyster</h1>
          <p className="text-xl md:text-2xl text-blue-100 font-medium text-center mb-8 animate-fade-in">The Ultimate Flying Adventure</p>
          
          {/* Error Message */}
          {error && (
            <ErrorMessage 
              error={error} 
              className="w-full max-w-md mb-6"
            />
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full justify-center items-center">
            {isClient ? (
              <button
                onClick={handleWalletClick}
                disabled={isPending}
                className="flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-white/30 transition text-base backdrop-blur border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet size={20} className="inline-block" />
                {getWalletButtonText()}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-2 rounded-xl shadow-lg text-base backdrop-blur border border-white/30 opacity-50 cursor-not-allowed"
              >
                <Wallet size={20} className="inline-block" />
                Connect Wallet
              </button>
            )}
            <Link href="/flappyster">
              <button className="flex items-center gap-2 bg-blue-200/40 text-blue-900 font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-blue-200/60 transition text-base backdrop-blur border border-blue-100/30">
                <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
                Play Now
              </button>
            </Link>
          </div>

          {/* User Profile Info - Only show if not in header */}
          {isClient && user?.farcaster_profile && !isConnected && (
            <div className="mb-6">
              <FarcasterProfileDisplay profile={user.farcaster_profile} />
            </div>
          )}
          
          {/* Points Display - Always visible in main content */}
          {isClient && (
            <div className="flex flex-row items-center bg-white/20 rounded-2xl px-5 py-3 shadow-lg mt-4 animate-fade-in min-w-[160px] gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400">
                <FaCoins size={18} className="text-yellow-900" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-extrabold text-white text-center">
                  {loading ? "..." : user?.total_points ?? 0}
                </span>
                <span className="text-blue-100 font-semibold text-sm text-center">Points</span>
              </div>
            </div>
          )}
          
          {/* Additional Info */}
          {isClient && isConnected && (
            <div className="text-center text-blue-100 text-sm mt-4">
              {user?.farcaster_profile ? (
                <p>Welcome back! Your Farcaster profile is connected.</p>
              ) : (
                <p>Connecting to Farcaster to fetch your profile...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}