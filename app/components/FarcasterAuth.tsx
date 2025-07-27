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
      // For now, we'll use a simple approach to fetch Farcaster profile
      // This will be replaced with proper SIWF implementation later
      const response = await fetch('/api/farcaster/profile?wallet_address=' + encodeURIComponent(window.ethereum?.selectedAddress || ''));
      
      if (!response.ok) {
        throw new Error('Failed to fetch Farcaster profile');
      }
      
      const profileData = await response.json();
      
      if (profileData.success && profileData.profile) {
        onAuthSuccess({
          success: true,
          fid: profileData.profile.fid,
          profile: profileData.profile
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