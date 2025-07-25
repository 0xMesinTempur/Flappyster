"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  id: string;
  wallet: string;
  point: number;
  last_checkin: string | null;
  created_at: string;
  username?: string | null;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  refreshUser: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrCreateUser = async () => {
    if (!address) {
      setUser(null);
      return;
    }
    setLoading(true);
    // Cek user di Supabase
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet", address)
      .single();
    if (!userData && !error) {
      // Insert user baru jika belum ada
      const { data: newUser } = await supabase
        .from("users")
        .insert([{ wallet: address }])
        .select()
        .single();
      if (newUser) setUser(newUser as UserData);
      else setUser(null);
    } else if (userData) {
      setUser(userData as UserData);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchOrCreateUser();
    } else {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchOrCreateUser }}>
      {children}
    </UserContext.Provider>
  );
} 