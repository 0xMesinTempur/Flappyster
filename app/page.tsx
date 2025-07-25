"use client";

import Link from "next/link";
import { FaCoins } from "react-icons/fa";
import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect } from "react";
import { useUser } from "@/app/components/UserContext";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { user, loading } = useUser();

  // Auto-connect saat user masuk
  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      // Coba connect dengan connector pertama (MiniAppWagmiConnector)
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, connect]);

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex flex-col items-center w-full px-4 pt-10">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg text-center mb-6 mt-2 animate-glow">Flappyster</h1>
        <p className="text-xl md:text-2xl text-blue-100 font-medium text-center mb-8 animate-fade-in">The Ultimate Flying Adventure</p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full justify-center items-center">
          <button 
            onClick={handleWalletClick}
            disabled={isPending}
            className="flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-white/30 transition text-base backdrop-blur border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet size={20} className="inline-block" />
            {isConnected 
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : isPending 
              ? "Connecting..."
              : "Connect Wallet"
            }
          </button>
          <Link href="/flappyster">
            <button className="flex items-center gap-2 bg-blue-200/40 text-blue-900 font-bold px-6 py-2 rounded-xl shadow-lg hover:bg-blue-200/60 transition text-base backdrop-blur border border-blue-100/30">
              <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
              Play Now
            </button>
          </Link>
        </div>
        {/* Points UI */}
        <div className="flex flex-row items-center bg-white/20 rounded-2xl px-5 py-3 shadow-lg mt-2 animate-fade-in min-w-[160px] gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400">
            <FaCoins size={18} className="text-yellow-900" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-extrabold text-white text-center">
              {loading ? "..." : user?.point ?? 0}
            </span>
            <span className="text-blue-100 font-semibold text-sm text-center">Points</span>
          </div>
        </div>
      </div>
    </div>
  );
}
