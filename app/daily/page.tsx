"use client";
import { useUser } from "@/app/components/UserContext";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function DailyCheckIn() {
  const { user, refreshUser } = useUser();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();

  // Cek apakah sudah check-in dalam 24 jam terakhir
  const lastCheckin = user?.last_checkin ? dayjs(user.last_checkin) : null;
  const now = dayjs();
  const canCheckIn = !lastCheckin || now.diff(lastCheckin, "hour") >= 24;

  // Progress 7 hari (dummy, bisa dihubungkan ke riwayat check-in jika ingin)
  const checkedInDays = user?.last_checkin ? 1 : 0; // Sementara: 1 jika pernah check-in
  const totalDays = 7;

  const handleCheckIn = async () => {
    if (!user || !address || !canCheckIn) return;
    setLoading(true);
    try {
      // Kirim transaksi on-chain (0 ETH ke diri sendiri, chainId BASE)
      await sendTransactionAsync({
        to: "0x96eF7ba758adDd3ba0FA46036E4eeaD4685f31Ee", // wallet dev
        value: parseEther("0.0000028"),
        chainId: 8453, // BASE mainnet
      });
      // Update point & last_checkin di Supabase
      const { error } = await supabase
        .from("users")
        .update({
          point: (user.point ?? 0) + 100,
          last_checkin: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshUser();
    } catch (err) {
      let errorMsg = "";
      if (err && typeof err === "object" && "message" in err) {
        errorMsg = (err as Error).message;
      }
      alert("Transaksi gagal atau dibatalkan. " + errorMsg);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-2">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Daily Check-In</h1>
      <p className="text-blue-700 text-base mb-6 text-center max-w-xs">Check in every day to earn rewards! Collect 7 days in a row for a special bonus.</p>

      {/* Progress 7 hari */}
      <div className="flex gap-3 mb-8">
        {[...Array(totalDays)].map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${i < checkedInDays ? "bg-blue-500 border-blue-700 text-white" : i === checkedInDays ? "bg-blue-100 border-blue-400 text-blue-700 animate-bounce" : "bg-white border-blue-200 text-blue-300"}
            `}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Tombol Check-In */}
      <button
        className={`w-full max-w-xs px-6 py-3 rounded-xl text-lg font-bold shadow transition
          ${!canCheckIn || loading ? "bg-blue-200 text-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}
        `}
        disabled={!canCheckIn || loading}
        onClick={handleCheckIn}
      >
        {loading
          ? "Processing..."
          : canCheckIn
            ? "Check In"
            : "Checked In (wait 24h)"}
      </button>

      {/* Hadiah hari ini */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-2xl">🎁</span>
        <span className="text-blue-700 font-medium mt-1">Today&apos;s Reward: 100 Points</span>
      </div>
    </main>
  );
} 