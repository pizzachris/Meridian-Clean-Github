'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlashCard from '../../../components/flashcards/FlashCard';
import type { MeridianPoint3 } from '../../../types/points';
import points from '../../../data/points.json';


export default function PointPage({ params }: { params: { id: string } }) {
  const [point, setPoint] = useState<MeridianPoint3 | null>(null);

  useEffect(() => {
    setPoint(points.find((p: MeridianPoint3) => p.id === params.id) || null);
  }, [params.id]);

  if (!point) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gold">Loading point...</div>
      </div>
    );
  }

  return <FlashCard point={point} />;
}
