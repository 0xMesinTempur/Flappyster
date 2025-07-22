"use client";
import { useState } from "react";
import FlappysterGame from "../components/FlappysterGame";

export default function FlappysterPage() {
  const [score, setScore] = useState(0);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400">
      <FlappysterGame onScoreChange={setScore} />
      <div className="mt-4 text-blue-700 text-lg font-bold">
        Skor real-time: {score}
      </div>
    </main>
  );
}
