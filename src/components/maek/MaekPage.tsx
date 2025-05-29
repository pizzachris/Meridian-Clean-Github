'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { MeridianPoint3 } from '../../types/points';
import IconDisplay from '../ui/IconDisplay';

interface MaekPageProps {
  type: 'chi-ki' | 'cha-ki';
  points: MeridianPoint3[];
  progress: number;
}

export default function MaekPage({ type, points, progress }: MaekPageProps) {
  const router = useRouter();
  const isChiKi = type === 'chi-ki';

  return (
    <main className="min-h-screen bg-black flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 mb-4 relative">
          <IconDisplay type={type} size={80} />
        </div>
        <h1 className="text-center">
          <span className="block text-[var(--gold-primary)] text-xl font-serif mb-1">
            {isChiKi ? 'MAEK CHI KI' : 'MAEK CHA KI'}
          </span>
          <span className="block text-[var(--subtext-color)] text-base font-serif italic">
            {isChiKi ? 'Hand Techniques' : 'Foot Techniques'}
          </span>
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-[#181818] rounded-full h-2 mb-8">
        <div 
          className="bg-[var(--gold-primary)] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Points List */}
      <div className="w-full max-w-md space-y-4">
        {points.map(point => (
          <div 
            key={point.id}
            className="bg-[#181818] border border-[var(--gold-primary)] rounded-xl p-4 hover:bg-[#222] transition cursor-pointer"
            onClick={() => router.push(`/points/${point.id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[var(--gold-primary)] font-serif text-lg">{point.id}</h3>
                <p className="text-[var(--subtext-color)] font-serif italic">{point.korean}</p>
              </div>
              <div className="text-2xl">
                {point.martial ? '⚔️' : '🔍'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
