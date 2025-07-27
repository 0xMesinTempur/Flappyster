"use client";

import { FarcasterProfile } from "@/lib/farcasterAuth";
import Image from "next/image";

interface FarcasterProfileDisplayProps {
  profile: FarcasterProfile;
}

export default function FarcasterProfileDisplay({ profile }: FarcasterProfileDisplayProps) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30 max-w-sm mx-auto">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={`${profile.displayName || profile.username}'s avatar`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg ${profile.avatar ? 'hidden' : ''}`}>
            {profile.displayName?.charAt(0) || profile.username?.charAt(0) || '?'}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">
            {profile.displayName || profile.username || "Anonymous"}
          </div>
          <div className="text-sm text-blue-100 truncate">
            @{profile.username || "user"}
          </div>
          {profile.bio && (
            <div className="text-xs text-blue-200 mt-1 line-clamp-2">
              {profile.bio}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="text-right text-xs text-blue-100">
          <div className="font-semibold">{profile.followersCount?.toLocaleString() || 0}</div>
          <div>followers</div>
          <div className="font-semibold mt-1">{profile.followingCount?.toLocaleString() || 0}</div>
          <div>following</div>
        </div>
      </div>
    </div>
  );
} 