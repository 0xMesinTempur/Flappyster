import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getFarcasterProfileByWallet } from "@/lib/farcasterAuth";

// TODO: Implement quick-auth when methods are available
// import { createClient } from "@farcaster/quick-auth";
// const client = createClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address, messageBytes, signature } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    let userFid = null;
    let profile = null;

    // If we have SIWF credentials, process them
    if (messageBytes && signature) {
      try {
        console.log('Processing SIWF credentials...');
        console.log('SIWF credentials received:', { messageBytes, signature });
        
        // TODO: Implement proper SIWF verification when quick-auth methods are available
        // For now, we'll continue with wallet-based profile fetching
        console.log('SIWF verification will be implemented when quick-auth methods are available');
      } catch (error) {
        console.error('Error processing SIWF credentials:', error);
      }
    }

    // Try to get Farcaster profile by wallet address
    try {
      console.log('Fetching Farcaster profile by wallet address...');
      profile = await getFarcasterProfileByWallet(wallet_address);
      if (profile) {
        userFid = profile.fid;
        console.log('Profile fetched using wallet address:', profile.username);
      }
    } catch (error) {
      console.error('Error fetching Farcaster profile by wallet:', error);
    }

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: "Failed to validate user" },
        { status: 500 }
      );
    }

    if (existingUser) {
      // Update existing user with Farcaster profile if available
      if (profile && (!existingUser.farcaster_profile || existingUser.fid !== userFid)) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            farcaster_profile: profile,
            fid: userFid,
            username: profile.username,
            display_name: profile.displayName
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
        } else {
          console.log('User profile updated in database');
        }
      }

      return NextResponse.json({
        success: true,
        user: {
          ...existingUser,
          farcaster_profile: profile || existingUser.farcaster_profile,
          fid: userFid || existingUser.fid,
          username: profile?.username || existingUser.username,
          display_name: profile?.displayName || existingUser.display_name
        }
      });
    } else {
      // Create new user
      const newUser = {
        wallet_address: wallet_address.toLowerCase(),
        total_points: 0,
        fid: userFid,
        username: profile?.username,
        display_name: profile?.displayName,
        farcaster_profile: profile
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('Supabase create error:', createError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }

      console.log('New user created in database');
      return NextResponse.json({
        success: true,
        user: createdUser
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 