'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegionData, RegionKey, BodyMapPoint } from '../../types/bodymap';
import { regionData } from '../../data/regions';
import Link from 'next/link';

interface RegionViewProps {
  region: RegionKey;
  onBack: () => void;
}

export default function RegionView({ region, onBack }: RegionViewProps) {
  const [isBackView, setIsBackView] = useState(false);
  const regionInfo: RegionData = regionData[region];
  const router = useRouter();
  
  const handlePointClick = (point: BodyMapPoint) => {
    router.push(`/points/${point.id}`);
  };

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <h2 className="text-[length:clamp(22px,5vw,30px)] font-bold mb-5">{regionInfo.title}</h2>
      
      <div className="relative w-full max-w-[320px] mx-auto">
        <img
          src={isBackView && regionInfo.backImage ? regionInfo.backImage : regionInfo.image}
          alt={regionInfo.title}
          className="w-full h-auto"
        />
        
        <div className="absolute inset-0">
          {regionInfo.points.map((point) => (
            <div key={point.id}>
              <button
                onClick={() => handlePointClick(point)}
                className="absolute w-6 h-6 bg-[var(--gold-primary)] border-2 border-[var(--gold-hover)] rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:bg-[var(--gold-hover)] transition-colors shadow-lg"
                style={{ top: point.top, left: point.left }}
                aria-label={`Select point ${point.id}`}
              />
              <div
                className="absolute font-bold text-sm transform -translate-x-1/2 translate-y-2 text-[var(--gold-primary)] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                style={{ top: point.top, left: `calc(${point.left} + 5%)` }}
              >
                {point.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {regionInfo.backImage && (
        <button
          onClick={() => setIsBackView(!isBackView)}
          className="button w-full max-w-[280px] mt-4"
        >
          {isBackView ? "SHOW FRONT VIEW" : "SHOW BACK VIEW"}
        </button>
      )}

      <Link href="/flashcards" className="button button-primary w-full max-w-[280px] mt-4">
        VIEW POINT
      </Link>

      <p className="tagline mt-4">
        Master your meridians.<br/>
        Restore your power.
      </p>

      <button
        onClick={onBack}
        className="button w-full max-w-[280px] mt-4"
      >
        BACK TO MAP
      </button>
    </div>
  );
}
