// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseKey || 'your-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Database interfaces - updated to match actual table structure
export interface User {
  id: string;
  wallet_address: string;
  total_points: number;
  username?: string | null;
  fid?: number | null;
  display_name?: string | null;
  farcaster_profile?: {
    fid: number;
    username: string;
    displayName: string;
    avatar: string;
    bio?: string;
    followers?: number;
    following?: number;
  } | null;
  last_checkin?: string | null;
  created_at?: string | null;
}

export interface GameHistory {
  id: string;
  wallet_address: string;
  points_earned: number;
  game_type: string;
  created_at: string;
}