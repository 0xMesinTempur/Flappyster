// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database interfaces
export interface User {
  id: string;
  wallet_address: string;
  total_points: number;
  last_checkin: string | null;
  created_at: string;
  username?: string | null;
}

export interface GameHistory {
  id: string;
  wallet_address: string;
  points_earned: number;
  game_type: string;
  created_at: string;
}