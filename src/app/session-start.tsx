import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SessionStartPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'meridian' | 'region' | 'theme'>('meridian');

  return (
    <main className="flex flex-col items-center min-h-screen bg-black px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--gold-primary)] font-serif">Start Daily Session</h1>
      <div className="flex gap-2 mb-8">
        <button
          className={`px-4 py-2 rounded-xl font-serif font-bold border-2 ${tab === 'meridian' ? 'bg-[var(--gold-primary)] text-black border-[var(--gold-primary)]' : 'bg-[#181818] text-[var(--gold-primary)] border-[var(--gold-primary)]'}`}
          onClick={() => setTab('meridian')}
        >
          By Meridian
        </button>
        <button
          className={`px-4 py-2 rounded-xl font-serif font-bold border-2 ${tab === 'region' ? 'bg-[var(--gold-primary)] text-black border-[var(--gold-primary)]' : 'bg-[#181818] text-[var(--gold-primary)] border-[var(--gold-primary)]'}`}
          onClick={() => setTab('region')}
        >
          By Region
        </button>
        <button
          className={`px-4 py-2 rounded-xl font-serif font-bold border-2 ${tab === 'theme' ? 'bg-[var(--gold-primary)] text-black border-[var(--gold-primary)]' : 'bg-[#181818] text-[var(--gold-primary)] border-[var(--gold-primary)]'}`}
          onClick={() => setTab('theme')}
        >
          By Theme
        </button>
      </div>
      {tab === 'meridian' && (
        <button
          className="w-full max-w-xs bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold mb-4"
          onClick={() => router.push('/meridian-select')}
        >
          Select Meridian
        </button>
      )}
      {tab === 'region' && (
        <button
          className="w-full max-w-xs bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold mb-4"
          onClick={() => router.push('/region-select')}
        >
          Select Region
        </button>
      )}
      {tab === 'theme' && (
        <button
          className="w-full max-w-xs bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold mb-4"
          onClick={() => router.push('/theme-select')}
        >
          Select Theme
        </button>
      )}
      <button
        onClick={() => router.push('/')}
        className="mt-10 text-[var(--gold-primary)] font-serif text-sm hover:underline"
      >
        Back to Home
      </button>
    </main>
  );
}
