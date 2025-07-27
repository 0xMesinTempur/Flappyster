"use client";

import Link from "next/link";
import { FaCoins } from "react-icons/fa";
import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { useUser } from "@/app/components/UserContext";
import FarcasterAuth from "@/app/components/FarcasterAuth";
import FarcasterProfileDisplay from "@/app/components/FarcasterProfile";
import ErrorMessage from "@/app/components/ErrorMessage";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, loading, error, handleFarcasterAuthSuccess, handleFarcasterAuthError } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex flex-col items-center w-full px-4 pt-10">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg text-center mb-6 mt-2 animate-glow">Flappyster</h1>
        <p className="text-xl md:text-2xl text-blue-100 font-medium text-center mb-8 animate-fade-in">The Ultimate Flying Adventure</p>
        
        {/* Error Message */}
        {error && (
          <ErrorMessage 
            error={error} 
            className="w-full max-w-md"
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

        {/* Farcaster Authentication */}
        {isClient && isConnected && !user?.farcaster_profile && (
          <div className="mb-6">
            <FarcasterAuth 
              onAuthSuccess={handleFarcasterAuthSuccess}
              onAuthError={handleFarcasterAuthError}
            />
          </div>
        )}

        {/* User Profile Info */}
        {isClient && user?.farcaster_profile && (
          <div className="mb-4">
            <FarcasterProfileDisplay profile={user.farcaster_profile} />
          </div>
        )}
        
        {/* Points UI */}
        {isClient && (
          <div className="flex flex-row items-center bg-white/20 rounded-2xl px-5 py-3 shadow-lg mt-2 animate-fade-in min-w-[160px] gap-3">
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
      </div>
    </div>
  );
}