"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, Trophy } from "lucide-react";

const navItems = [
  { label: "Play", icon: Home, href: "/" },
  { label: "Daily Check-In", icon: Gift, href: "/daily" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  if (pathname === "/flappyster") return null;
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-blue-900/40 backdrop-blur-lg border-t border-blue-400/30 flex justify-around items-center py-2 shadow-lg z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center transition-all duration-200
              ${isActive
                ? "bg-white/30 backdrop-blur rounded-xl px-5 py-2 shadow-md"
                : "hover:bg-white/20 hover:backdrop-blur rounded-xl px-5 py-2"}
            `}
          >
            <Icon size={24} className={`mb-1 transition ${isActive ? "text-white scale-110" : "text-blue-400"}`} />
            <span className={`text-xs font-semibold transition ${isActive ? "text-white" : "text-blue-400"}`}>{item.label}</span>
            {isActive && <span className="w-2 h-2 bg-blue-200 rounded-full mt-1"></span>}
          </Link>
        );
      })}
    </nav>
  );
} 