export default function DailyCheckIn() {
  // Dummy data: hari ke-3 sudah check-in
  const checkedInDays = 3;
  const todayCheckedIn = false;
  const totalDays = 7;

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
          ${todayCheckedIn ? "bg-blue-200 text-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}
        `}
        disabled={todayCheckedIn}
      >
        {todayCheckedIn ? "Checked In" : "Check In"}
      </button>

      {/* Hadiah hari ini */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-2xl">🎁</span>
        <span className="text-blue-700 font-medium mt-1">Today&apos;s Reward: 10 Points</span>
      </div>
    </main>
  );
} 