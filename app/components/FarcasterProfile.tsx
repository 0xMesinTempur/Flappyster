"use client";
import { useUser } from "./UserContext";
import Image from "next/image";

export default function FarcasterProfile() {
  const { user, refreshFarcasterProfile } = useUser();

  if (!user?.farcaster_profile) {
    return (
      <div className="bg-white/20 backdrop-blur rounded-full p-2 shadow-lg border border-white/30">
        <button
          onClick={refreshFarcasterProfile}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 transition flex items-center justify-center"
          title="Connect Farcaster"
        >
          <span className="text-white text-lg">+</span>
        </button>
      </div>
    );
  }

  const profile = user.farcaster_profile;

  return (
    <div className="bg-white/20 backdrop-blur rounded-full p-1 shadow-lg border border-white/30">
      {profile.avatar ? (
        <Image 
          src={profile.avatar} 
          alt="Farcaster Avatar" 
          width={48}
          height={48}
          className="w-12 h-12 rounded-full border-2 border-purple-300 cursor-pointer hover:scale-105 transition"
          title={`@${profile.username}`}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {profile.displayName?.charAt(0) || profile.username?.charAt(0) || '?'}
          </span>
        </div>
      )}
    </div>
  );
} 