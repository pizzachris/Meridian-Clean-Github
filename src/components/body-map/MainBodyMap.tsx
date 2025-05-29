'use client';

import { useState } from 'react';
import { RegionKey } from '../../types/bodymap';

interface MainBodyMapProps {
  onRegionSelect: (region: RegionKey) => void;
}

export default function MainBodyMap({ onRegionSelect }: MainBodyMapProps) {
  const [isBackView, setIsBackView] = useState(false);

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      <div className="relative w-full max-w-[320px] mx-auto my-5">
        <img
          src={isBackView ? "/images/body-back.png" : "/images/body-front.png"}
          alt="Body Map"
          className="w-full h-auto"
        />
      </div>

      <button
        onClick={() => setIsBackView(!isBackView)}
        className="button w-full max-w-[280px] mb-4"
      >
        {isBackView ? "SHOW FRONT VIEW" : "SHOW BACK VIEW"}
      </button>

      <div className="w-full max-w-[280px] space-y-2">
        <button onClick={() => onRegionSelect('head')} className="button">HEAD & NECK</button>
        <button onClick={() => onRegionSelect('arms')} className="button">ARMS</button>
        <button onClick={() => onRegionSelect('trunk')} className="button">TRUNK</button>
        <button onClick={() => onRegionSelect('legs')} className="button">LEGS</button>
        <button onClick={() => onRegionSelect('feet')} className="button">FEET</button>
      </div>

      <p className="tagline mt-6">Tap on a body region to view available points.</p>
    </div>
  );
}
