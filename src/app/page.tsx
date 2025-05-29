"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import points from '../data/points.json';
import dynamic from 'next/dynamic';
import IconDisplay from '../components/ui/IconDisplay';

const ServiceWorkerRegister = dynamic(
  () => import('../components/flashcards/ServiceWorkerRegister'),
  { ssr: false }
);

const meridians = [
  'Lung', 'Large Intestine', 'Stomach', 'Spleen', 'Heart', 'Small Intestine',
  'Urinary Bladder', 'Kidney', 'Pericardium', 'Triple Burner', 'Gall Bladder', 'Liver'
];

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'region' | 'theme' | 'meridian'>('meridian');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center min-h-screen bg-black px-4 py-8">
      <ServiceWorkerRegister />
      
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <IconDisplay size={96} className="mb-4" />
        <h1 className="text-center">
          <span className="block text-[var(--gold-primary)] text-xl font-serif mb-1">MERIDIAN</span>
          <span className="block text-[var(--gold-primary)] text-3xl font-serif font-bold tracking-wide">MASTERY</span>
        </h1>
      </div>

      {/* Main Navigation Buttons */}
      <div className="flex flex-col w-full max-w-md gap-4 mb-8">
        <button 
          onClick={() => router.push('/session-start')}
          className="w-full bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold transition-all hover:bg-[#8B3333] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          START DAILY SESSION
        </button>
        
        <button 
          onClick={() => router.push('/flashcards')}
          className="w-full bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold transition-all hover:bg-[#8B3333] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          FLASHCARD TRAINER
        </button>
        
        <button 
          onClick={() => router.push('/body-map')}
          className="w-full bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold transition-all hover:bg-[#8B3333] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          EXPLORE BODY MAP
        </button>
        
        <button 
          onClick={() => router.push('/progress')}
          className="w-full bg-[#7B2323] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-4 rounded-xl font-serif text-lg font-bold transition-all hover:bg-[#8B3333] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          YOUR PROGRESS
        </button>
      </div>

      {/* Additional Navigation & Settings */}
      <div className="flex flex-col w-full max-w-md gap-3">
        <button 
          onClick={() => router.push('/symptom-search')}
          className="w-full bg-[#181818] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-3 rounded-xl font-serif font-bold transition-all hover:bg-[#222] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          SYMPTOM TRACKER
        </button>
        
        <button 
          onClick={() => router.push('/settings')}
          className="w-full bg-[#181818] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] py-3 rounded-xl font-serif font-bold transition-all hover:bg-[#222] hover:border-[var(--gold-hover)] hover:scale-[1.02]"
        >
          SETTINGS
        </button>
      </div>

      {/* Tagline */}
      <p className="text-[var(--gold-primary)] font-serif text-lg mt-12 text-center opacity-80">
        Master your meridians.
        <br />
        Restore and protect.
      </p>
    </main>
  );
}
