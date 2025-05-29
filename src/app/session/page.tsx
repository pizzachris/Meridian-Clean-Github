'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SessionController from '../../components/flashcards/SessionController';
import points from '../../data/points.json';

type ValidMode = 'maek' | 'cha' | 'meridian' | 'theme' | 'region';

const MODE_LABELS = {
  'region': 'BY REGION',
  'theme': 'BY THEME',
  'meridian': 'BY MERIDIAN'
};

export default function SessionPage() {
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [currentMode, setCurrentMode] = useState<ValidMode>('meridian');
  const [currentItem, setCurrentItem] = useState<string>('');

  useEffect(() => {
    const mode = searchParams?.get('mode');
    // Validate that mode is one of the allowed types
    if (mode && ['maek', 'cha', 'meridian', 'theme', 'region'].includes(mode)) {
      setCurrentMode(mode as ValidMode);
    }
    const item = searchParams?.get('item');
    
    if (!mode || !item) {
      window.location.href = '/';
      return;
    }

    localStorage.setItem('sessionMode', mode);
    localStorage.setItem('sessionItem', item);
    localStorage.setItem('sessionStartTime', Date.now().toString());
    setInitialized(true);
  }, [searchParams]);
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-pulse text-[var(--gold-primary)] font-serif">
          Initializing session...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black py-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icons/logo-64.png" alt="Meridian Mastery Coach" className="w-12 h-12" />
          <div className="flex flex-col">
            <span className="text-[var(--gold-primary)] text-sm font-serif">MERIDIAN</span>
            <span className="text-[var(--gold-primary)] text-sm font-serif">MASTERY COACH</span>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <button className="bg-black border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] px-4 py-1.5 rounded-lg font-serif text-sm transition hover:bg-[#7B2323]">
            {MODE_LABELS[currentMode as keyof typeof MODE_LABELS] || 'START DAILY SESSION'}
          </button>
        </div>
      </div>

      {/* Session instructions */}
      <div className="text-[var(--gold-primary)] text-base font-serif mb-4 text-center">
        Select a meridian to train
      </div>

      {/* Flashcard container */}
      <SessionController
        initialPoints={points}
        mode={currentMode}
        item={currentItem}
      />

      <div className="flex justify-center mt-2">
        <button className="text-[var(--gold-primary)] font-serif text-sm hover:underline">
          BEGIN
        </button>
      </div>
    </main>
  );
}
