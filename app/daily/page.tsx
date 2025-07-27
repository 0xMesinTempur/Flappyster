"use client";
import { useUser } from "@/app/components/UserContext";
import { useAccount, useSendTransaction, useChainId, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

export default function DailyCheckIn() {
  const { user, refreshUser, loading: userLoading, error: userError } = useUser();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const { sendTransaction, isPending: isSending, data: txData } = useSendTransaction();
  const [txError, setTxError] = useState("");
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const BASE_CHAIN_ID = 8453;
  const RECIPIENT_ADDRESS = "0x96eF7ba758adDd3ba0FA46036E4eeaD4685f31Ee";
  const TRANSACTION_AMOUNT = "0.0000028";

  // Cek apakah sudah check-in dalam 24 jam terakhir
  const lastCheckin = user?.last_checkin ? dayjs(user.last_checkin) : null;
  const now = dayjs();
  const canCheckIn = !lastCheckin || now.diff(lastCheckin, "hour") >= 24;

  // Progress 7 hari (dummy, bisa dihubungkan ke riwayat check-in jika ingin)
  const checkedInDays = user?.last_checkin ? 1 : 0;
  const totalDays = 7;



  const handleCheckIn = async () => {
    if (!user || !address || hasCheckedIn) return;

    try {
      // Check if user can check in
      if (!canCheckIn) {
        setTxError("You've already checked in today!");
        return;
      }

      setLoading(true);
      setHasCheckedIn(true);
      setTxError("");

      // Check if connected to Base network
      if (chainId !== BASE_CHAIN_ID) {
        // Switch to Base network
        await switchChain({ chainId: BASE_CHAIN_ID });
      }

      // Send transaction - this will trigger wallet popup
      await sendTransaction({
        to: RECIPIENT_ADDRESS as `0x${string}`,
        value: parseEther(TRANSACTION_AMOUNT),
        chainId: BASE_CHAIN_ID,
      });

      // Note: The transaction will be handled asynchronously
      // User will see wallet popup and can confirm/reject
      
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setTxError("Transaction cancelled by user");
      } else {
        setTxError(`Check-in failed: ${error.message || 'Unknown error'}`);
      }
      setLoading(false);
      setHasCheckedIn(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (txData && !isSending && hasCheckedIn && user && address) {
      // Transaction was successful, update database
      const updateDatabase = async () => {
        try {
          // Check again if user can check in (double check)
          const lastCheckin = user?.last_checkin ? dayjs(user.last_checkin) : null;
          const now = dayjs();
          const canCheckInNow = !lastCheckin || now.diff(lastCheckin, "hour") >= 24;

          if (!canCheckInNow) {
            setTxError("You've already checked in today!");
            setHasCheckedIn(false);
            setLoading(false);
            return;
          }

          // Update user's last check-in
          const { error: updateError } = await supabase
            .from("users")
            .update({ last_checkin: new Date().toISOString() })
            .eq("id", user.id);

          if (updateError) {
            setTxError("Failed to update check-in status");
            setHasCheckedIn(false);
            setLoading(false);
            return;
          }

          // Add points for check-in
          const { error: pointsError } = await supabase
            .from("users")
            .update({ total_points: (user.total_points ?? 0) + 100 })
            .eq("id", user.id);

          if (pointsError) {
            setTxError("Failed to add points");
            setHasCheckedIn(false);
            setLoading(false);
            return;
          }

          // Add to game history
          await supabase.from("game_history").insert([{
            wallet_address: user.wallet_address,
            points_earned: 100,
            game_type: 'checkin'
          }]);

          // Refresh user data
          await refreshUser();
          setTxError("Daily check-in successful! You earned 100 points.");
          setLoading(false);
        } catch (err: unknown) {
          const error = err as { message?: string };
          setTxError(`Database update failed: ${error.message || 'Unknown error'}`);
          setHasCheckedIn(false);
          setLoading(false);
        }
      };

      updateDatabase();
    }
  }, [txData, isSending, hasCheckedIn, user, address, refreshUser]);

  // Jika belum connect wallet, tampilkan pesan info
  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-xs p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          Please connect your wallet on the main page to use this feature.
        </div>
      </main>
    );
  }

  // Jika user masih loading, tampilkan loading state
  if (userLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-xs p-4 bg-blue-100 text-blue-800 rounded text-center">
          Loading user data...
        </div>
      </main>
    );
  }

  // Jika ada error dari user context, tampilkan error
  if (userError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-xs p-4 bg-red-100 text-red-800 rounded text-center">
          <p className="mb-4">Database Error: {userError}</p>
          <button 
            onClick={() => refreshUser()} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Check if on wrong network
  const isWrongNetwork = chainId !== BASE_CHAIN_ID;

  // If user is null but wallet is connected, show refresh option
  if (!user && isConnected && !userLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-xs p-4 bg-orange-100 text-orange-800 rounded text-center">
          <p className="mb-4">User data not found. Please try refreshing.</p>
          <button 
            onClick={() => refreshUser()} 
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Refresh User Data
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-2">
      {txError && (
        <div className={`mb-4 p-2 rounded text-xs w-full max-w-xs ${
          txError.includes('successful') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {txError.includes('successful') ? '✅ ' : '❌ '}{txError}
        </div>
      )}
      
      {isWrongNetwork && (
        <div className="mb-4 p-2 bg-orange-100 rounded text-xs text-orange-700 w-full max-w-xs text-center">
          ⚠️ Please switch to Base network
        </div>
      )}



      <h1 className="text-3xl font-bold text-blue-800 mb-2">Daily Check-In</h1>
      <p className="text-blue-700 text-base mb-6 text-center max-w-xs">
        Check in every day to earn rewards! Collect 7 days in a row for a special bonus.
      </p>

      {/* Progress 7 hari */}
      <div className="flex gap-3 mb-8">
        {[...Array(totalDays)].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${i < checkedInDays 
                ? "bg-blue-500 border-blue-700 text-white" 
                : i === checkedInDays 
                ? "bg-blue-100 border-blue-400 text-blue-700 animate-bounce" 
                : "bg-white border-blue-200 text-blue-300"}
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Tombol Check-In */}
      <button
        className={`w-full max-w-xs px-6 py-3 rounded-xl text-lg font-bold shadow transition
          ${!canCheckIn || loading || isWrongNetwork || hasCheckedIn
            ? "bg-blue-200 text-blue-400 cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}
        `}
        disabled={!canCheckIn || loading || isWrongNetwork || hasCheckedIn}
        onClick={handleCheckIn}
      >
        {loading
          ? "Processing..."
          : hasCheckedIn
            ? "Check-in Complete!"
            : !canCheckIn
            ? "Checked In (wait 24h)"
            : isWrongNetwork
            ? "Switch to Base Network"
            : "Check In"}
      </button>

      {/* Hadiah hari ini */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-2xl">🎁</span>
        <span className="text-blue-700 font-medium mt-1">Today&apos;s Reward: 100 Points</span>
      </div>


    </main>
  );
}