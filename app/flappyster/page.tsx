"use client";
import FlappysterGame from "../components/FlappysterGame";

export default function FlappysterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400">
      <FlappysterGame />
    </main>
  );
}
