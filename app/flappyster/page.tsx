"use client";
import FlappysterGame from "../components/FlappysterGame";
import { useUser } from "../components/UserContext";

export default function FlappysterPage() {
  const { refreshUser } = useUser();

  // Handler dipanggil saat skor berubah
  const handleScoreChange = (score: number) => {
    // Jika game over (score kembali ke 0), refresh user agar Points di tampilan depan update
    if (score === 0) {
      refreshUser();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <FlappysterGame onScoreChange={handleScoreChange} />
    </main>
  );
}
