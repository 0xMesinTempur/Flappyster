"use client";

import { useState } from "react";
import { FarcasterAuthResult } from "@/lib/farcasterAuth";

interface FarcasterAuthProps {
  onAuthSuccess: (result: FarcasterAuthResult) => void;
  onAuthError: (error: string) => void;
}

export default function FarcasterAuth({ onAuthSuccess, onAuthError }: FarcasterAuthProps) {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      // Use the new auth validation endpoint
      const walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const { success, user } = await response.json();
      
      if (success && user && user.farcaster_profile) {
        onAuthSuccess({
          success: true,
          fid: user.fid,
          profile: user.farcaster_profile
        });
      } else {
        throw new Error('No Farcaster profile found for this wallet');
      }
    } catch (error) {
      onAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={loading}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Connect Farcaster"}
    </button>
  );
} 