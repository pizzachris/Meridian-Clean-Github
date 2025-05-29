import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CompletionSummaryProps {
  sessionMode: string;
  sessionItem: string;
  pointsReviewed: number;
  totalPoints: number;
  timeSpent: number;
}

export default function CompletionSummary({
  sessionMode,
  sessionItem,
  pointsReviewed,
  totalPoints,
  timeSpent
}: CompletionSummaryProps) {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Update streak
    const lastSession = localStorage.getItem('lastSessionDate');
    const today = new Date().toDateString();
    const currentStreak = parseInt(localStorage.getItem('streak') || '0');

    if (lastSession === today) {
      setStreak(currentStreak);
    } else {
      // Check if the last session was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastSession === yesterday.toDateString()) {
        const newStreak = currentStreak + 1;
        localStorage.setItem('streak', newStreak.toString());
        setStreak(newStreak);
        setShowConfetti(true);
      } else {
        localStorage.setItem('streak', '1');
        setStreak(1);
      }
      localStorage.setItem('lastSessionDate', today);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center px-4 z-50">
      <div className="bg-[var(--card-bg)] border-2 border-[var(--gold-primary)] rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-[var(--gold-primary)] text-3xl font-bold font-serif text-center mb-6">
          Session Complete!
        </h2>

        <div className="space-y-4">
          <div className="bg-[#111] rounded-xl p-4">
            <div className="text-[var(--subtext-color)] text-sm mb-1">Training Mode</div>
            <div className="text-white font-serif">{sessionMode} - {sessionItem}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] rounded-xl p-4">
              <div className="text-[var(--subtext-color)] text-sm mb-1">Points Reviewed</div>
              <div className="text-[var(--gold-primary)] font-bold">{pointsReviewed}/{totalPoints}</div>
            </div>

            <div className="bg-[#111] rounded-xl p-4">
              <div className="text-[var(--subtext-color)] text-sm mb-1">Time Spent</div>
              <div className="text-[var(--gold-primary)] font-bold">
                {Math.round(timeSpent / 60)} minutes
              </div>
            </div>
          </div>

          <div className="bg-[#111] rounded-xl p-4 text-center">
            <div className="text-[var(--subtext-color)] text-sm mb-1">Current Streak</div>
            <div className="text-[var(--gold-primary)] text-2xl font-bold flex items-center justify-center gap-2">
              {streak} {streak > 0 && '🔥'}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push('/progress')}
            className="bg-[var(--gold-primary)] text-black px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[var(--gold-hover)] transition"
          >
            VIEW PROGRESS
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-[var(--maroon-primary)] text-[var(--gold-primary)] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[var(--maroon-hover)] transition"
          >
            NEW SESSION
          </button>
        </div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Add confetti animation here */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}
    </div>
  );
}
