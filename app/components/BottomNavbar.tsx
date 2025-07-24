"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Daily Check-In", icon: "🎁", href: "/daily" },
  { label: "Leaderboard", icon: "🏆", href: "/leaderboard" },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  if (pathname === "/flappyster") return null;
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/90 border-t border-blue-200 flex justify-around items-center py-2 shadow-lg z-50 backdrop-blur-md">
      {navItems.map((item) => (
        <Link key={item.label} href={item.href} className="flex flex-col items-center flex-1">
          <span className={`text-2xl mb-1 transition ${pathname === item.href ? "text-blue-600 scale-110" : "text-blue-400"}`}>{item.icon}</span>
          <span className={`text-xs font-semibold transition ${pathname === item.href ? "text-blue-700" : "text-blue-400"}`}>{item.label}</span>
          {pathname === item.href && <span className="w-2 h-2 bg-blue-400 rounded-full mt-1"></span>}
        </Link>
      ))}
    </nav>
  );
} 