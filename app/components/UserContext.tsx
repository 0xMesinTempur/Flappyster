"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabaseClient";
import { getFarcasterProfileByWallet, FarcasterProfile } from "@/lib/farcasterAuth";

interface UserData {
  id: string;
  wallet_address: string;
  total_points: number;
  last_checkin: string | null;
  created_at: string;
  username?: string | null;
  farcaster_profile?: FarcasterProfile | null;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshFarcasterProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
  refreshUser: async () => {},
  refreshFarcasterProfile: async () => {},
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

  const fetchOrCreateUser = async () => {
    if (!address) {
      setUser(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Check if user exists
      const { data: userData, error: queryError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned
        setError(`Database error: ${queryError.message}`);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (!userData) {
        // Create new user if doesn't exist
        
        // Fetch Farcaster profile first
        const farcasterProfile = await fetchFarcasterProfileDebounced(address);
        
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert([{ 
            wallet_address: address,
            total_points: 0,
            last_checkin: null,
            username: farcasterProfile?.username || null
          }])
          .select()
          .single();
        
        if (insertError) {
          setError(`Failed to create user: ${insertError.message}`);
          setUser(null);
        } else if (newUser) {
          setUser({
            ...newUser as UserData,
            farcaster_profile: farcasterProfile
          });
          setError(null);
        } else {
          setError("Failed to create user");
          setUser(null);
        }
      } else {
        // Fetch Farcaster profile for existing user
        const farcasterProfile = await fetchFarcasterProfileDebounced(address);
        
        // Update username if it's null and we have Farcaster profile
        if (!userData.username && farcasterProfile?.username) {
          const { error: updateError } = await supabase
            .from("users")
            .update({ username: farcasterProfile.username })
            .eq("id", userData.id);
          
          if (!updateError) {
            setUser({
              ...userData as UserData,
              username: farcasterProfile.username,
              farcaster_profile: farcasterProfile
            });
          } else {
            setUser({
              ...userData as UserData,
              farcaster_profile: farcasterProfile
            });
          }
        } else {
          setUser({
            ...userData as UserData,
            farcaster_profile: farcasterProfile
          });
        }
        setError(null);
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
      
      // Update username in database if we have Farcaster profile
      if (profile?.username && user.username !== profile.username) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ username: profile.username })
          .eq("id", user.id);
        
        if (!updateError) {
          setUser(prev => prev ? { 
            ...prev, 
            username: profile.username,
            farcaster_profile: profile 
          } : null);
        } else {
          setUser(prev => prev ? { 
            ...prev, 
            farcaster_profile: profile 
          } : null);
        }
      } else {
        setUser(prev => prev ? { 
          ...prev, 
          farcaster_profile: profile 
        } : null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing Farcaster profile:', error);
      }
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchOrCreateUser();
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
      refreshUser: fetchOrCreateUser,
      refreshFarcasterProfile 
    }}>
      {children}
    </UserContext.Provider>
  );
} 