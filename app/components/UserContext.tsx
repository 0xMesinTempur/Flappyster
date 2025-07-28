"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useAccount } from "wagmi";
import { getFarcasterProfileByWallet, FarcasterProfile, FarcasterAuthResult } from "@/lib/farcasterAuth";

interface UserData {
  id: string;
  wallet_address: string;
  total_points: number;
  game_type?: string | null;
  username?: string | null;
  farcaster_profile?: FarcasterProfile | null;
  fid?: number | null;
  last_checkin?: string | null;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  fetchOrCreateUser: (walletAddress: string) => Promise<void>;
  refreshFarcasterProfile: () => Promise<void>;
  handleFarcasterAuthSuccess: (result: FarcasterAuthResult) => void;
  handleFarcasterAuthError: (error: string) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
  refreshUser: async () => {},
  fetchOrCreateUser: async () => {},
  refreshFarcasterProfile: async () => {},
  handleFarcasterAuthSuccess: async () => {},
  handleFarcasterAuthError: () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFarcasterProfile = async (walletAddress: string) => {
    try {
      const profile = await getFarcasterProfileByWallet(walletAddress);
      return profile;
    } catch (error) {
      // Only log critical errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching Farcaster profile:', error);
      }
      return null;
    }
  };

  // Debounce untuk mencegah multiple requests
  const debounceRef = useRef<NodeJS.Timeout>();
  const fetchFarcasterProfileDebounced = async (walletAddress: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    return new Promise<FarcasterProfile | null>((resolve) => {
      debounceRef.current = setTimeout(async () => {
        const profile = await fetchFarcasterProfile(walletAddress);
        resolve(profile);
      }, 1000); // 1 detik delay
    });
  };

  const handleFarcasterAuthSuccess = (result: FarcasterAuthResult) => {
    if (!user || !result.profile) return;

    try {
      // Update user dengan Farcaster profile
      const updatedUser = {
        ...user,
        username: result.profile.username,
        farcaster_profile: result.profile,
        fid: result.fid
      };

      // Note: Tidak bisa update database karena tabel tidak punya kolom username
      // Tapi kita bisa simpan di state untuk display
      setUser(updatedUser);
      setError(null);
    } catch (error) {
      console.error('Error handling Farcaster auth success:', error);
    }
  };

  const handleFarcasterAuthError = (error: string) => {
    setError(`Farcaster authentication failed: ${error}`);
  };

  const fetchOrCreateUser = async (walletAddress: string) => {
    if (!walletAddress) {
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use the new auth validation endpoint
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(`Authentication failed: ${errorData.error || 'Unknown error'}`);
        setUser(null);
        setLoading(false);
        return;
      }

      const { success, user: userData } = await response.json();
      
      if (success && userData) {
        setUser(userData as UserData);
        setError(null);
      } else {
        setError("Failed to authenticate user");
        setUser(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`);
      setUser(null);
    }
    
    setLoading(false);
  };

  const refreshFarcasterProfile = async () => {
    if (!user?.wallet_address) return;
    
    try {
      const profile = await fetchFarcasterProfileDebounced(user.wallet_address);
      
      setUser(prev => prev ? { 
        ...prev, 
        farcaster_profile: profile,
        fid: profile?.fid || null,
        username: profile?.username || null
      } : null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing Farcaster profile:', error);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchOrCreateUser(address);
    } else {
      setUser(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error, 
      refreshUser: () => fetchOrCreateUser(address || ''),
      fetchOrCreateUser,
      refreshFarcasterProfile,
      handleFarcasterAuthSuccess,
      handleFarcasterAuthError
    }}>
      {children}
    </UserContext.Provider>
  );
} 