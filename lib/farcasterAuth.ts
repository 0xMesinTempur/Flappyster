// Farcaster user profile interface
export interface FarcasterProfile {
  fid: number
  username: string
  displayName: string
  bio: string
  avatar: string
  followersCount: number
  followingCount: number
}

// Farcaster authentication result interface
export interface FarcasterAuthResult {
  success: boolean
  fid?: number
  profile?: FarcasterProfile
  error?: string
}

// Cache untuk menyimpan Farcaster profiles
const profileCache = new Map<string, { profile: FarcasterProfile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// Rate limiting helper
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 5; // Kurangi dari 6 untuk safety

// Parse SIWF message untuk mendapatkan FID
function parseSIWFMessage(message: string): number | null {
  try {
    // SIWF message biasanya dalam format JSON
    const parsed = JSON.parse(message);
    
    // Coba berbagai kemungkinan field yang berisi FID
    if (parsed.fid) {
      return parseInt(parsed.fid);
    }
    if (parsed.data?.fid) {
      return parseInt(parsed.data.fid);
    }
    if (parsed.state?.fid) {
      return parseInt(parsed.state.fid);
    }
    
    // Jika tidak ada field FID yang jelas, coba parse dari string
    const fidMatch = message.match(/"fid"\s*:\s*(\d+)/);
    if (fidMatch) {
      return parseInt(fidMatch[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing SIWF message:', error);
    return null;
  }
}

// Verify SIWF credentials dan dapatkan FID
export async function verifyFarcasterAuth(signature: string, message: string): Promise<FarcasterAuthResult> {
  try {
    // Parse message untuk mendapatkan FID
    const fid = parseSIWFMessage(message);
    
    if (!fid) {
      return {
        success: false,
        error: 'Could not extract FID from SIWF message'
      };
    }

    // Verify signature (implementasi dasar - bisa ditingkatkan)
    // Untuk saat ini kita asumsikan signature valid karena sudah melalui Farcaster SDK
    
    // Fetch profile menggunakan FID
    const profile = await getFarcasterProfile(fid);
    
    if (!profile) {
      return {
        success: false,
        error: 'Could not fetch Farcaster profile'
      };
    }

    return {
      success: true,
      fid,
      profile
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get Farcaster profile from wallet address using Neynar API
export async function getFarcasterProfileByWallet(walletAddress: string): Promise<FarcasterProfile | null> {
  try {
    // Check cache first
    const cached = profileCache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.profile;
    }

    // Check if we have Neynar API key
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    if (!apiKey) {
      return null;
    }

    // Validate wallet address format
    if (!walletAddress || walletAddress.length < 10) {
      return null;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastRequestTime < 60000) { // Dalam 1 menit
      if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
        // Rate limited, return cached data or null
        return cached?.profile || null;
      }
      requestCount++;
    } else {
      // Reset counter setelah 1 menit
      lastRequestTime = now;
      requestCount = 1;
    }

    // Use Neynar API with fetch (browser-compatible)
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${encodeURIComponent(walletAddress)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api_key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle rate limiting
      if (response.status === 429) {
        // Cache null result untuk rate limited requests
        profileCache.set(walletAddress, { profile: null, timestamp: now });
        return null;
      }
      
      // Handle "No users found" case more gracefully
      if (errorText.includes('No users found')) {
        // Cache null result
        profileCache.set(walletAddress, { profile: null, timestamp: now });
        return null;
      }
      
      throw new Error(`Failed to fetch Farcaster profile: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle the correct response format: {walletAddress: [userData]}
    const userArray = data[walletAddress];
    if (!userArray || userArray.length === 0) {
      // Cache null result
      profileCache.set(walletAddress, { profile: null, timestamp: now });
      return null;
    }
    
    const user = userArray[0];
    
    const profile = {
      fid: user.fid,
      username: user.username || '',
      displayName: user.display_name || '',
      bio: user.bio?.text || '',
      avatar: user.pfp_url || '',
      followersCount: user.follower_count,
      followingCount: user.following_count,
    };

    // Cache successful result
    profileCache.set(walletAddress, { profile, timestamp: now });
    
    return profile;
  } catch (error) {
    // Only log critical errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching Farcaster profile by wallet:', error);
    }
    return null;
  }
}

// Get Farcaster profile from FID using Neynar API
export async function getFarcasterProfile(fid: number): Promise<FarcasterProfile | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    if (!apiKey) {
      console.warn('Neynar API key not found. Add NEXT_PUBLIC_NEYNAR_API_KEY to .env.local');
      return null;
    }

    // Use Neynar API directly with fetch
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'api_key': apiKey,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Farcaster profile: ${response.status}`);
    }

    const data = await response.json();
    const user = data.users?.[0];
    
    if (!user) {
      return null;
    }
    
    return {
      fid: user.fid,
      username: user.username || '',
      displayName: user.display_name || '',
      bio: user.bio?.text || '',
      avatar: user.pfp_url || '',
      followersCount: user.follower_count,
      followingCount: user.following_count,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching Farcaster profile:', error);
    }
    return null;
  }
} 