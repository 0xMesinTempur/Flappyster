import { NextRequest, NextResponse } from 'next/server';
import { getFarcasterProfileByWallet } from '@/lib/farcasterAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Fetch Farcaster profile using wallet address
    const profile = await getFarcasterProfileByWallet(address);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'No Farcaster profile found for this wallet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching Farcaster profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      },
      { status: 500 }
    );
  }
} 