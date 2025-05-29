import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import FlashCard from './FlashCard';
import type { MeridianPoint3 as MeridianPoint, FlashcardPoint } from '../../types/points';
import { meridianFullNameToAbbrev } from '../../utils/meridianMapping';

const MERIDIANS = [
  'Lung',
  'Large Intestine',
  'Stomach',
  'Spleen',
  'Heart',
  'Small Intestine',
  'Urinary Bladder',
  'Kidney',
  'Pericardium',
  'Triple Burner',
  'Gall Bladder',
  'Liver'
];

interface SessionControllerProps {
  initialPoints: MeridianPoint[];
  mode: 'maek' | 'cha' | 'meridian' | 'theme' | 'region';
  item: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export default function SessionController({ initialPoints, mode, item }: SessionControllerProps) {
  const router = useRouter();
  const [points, setPoints] = useState<MeridianPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [selectedMeridian, setSelectedMeridian] = useState<string | null>(null);

  useEffect(() => {
    const filterPoints = () => {
      switch (mode) {
        case 'meridian': {
          const meridianCode = meridianFullNameToAbbrev[item] || item;
          return initialPoints.filter(p => p.meridian === meridianCode);
        }        case 'maek':
          return initialPoints.filter(p => p.id.startsWith('MCK') || p.notes?.includes('Maek'));
        case 'region':
          return initialPoints.filter(p => p.region && p.region.toLowerCase() === item.toLowerCase());
        case 'theme':
          return initialPoints.filter(p => p.healing?.toLowerCase().includes(item.toLowerCase()) || p.notes?.toLowerCase().includes(item.toLowerCase()));
        default:
          return [];
      }
    };

    const filteredPoints = filterPoints();
    
    if (filteredPoints.length > 0) {
      setPoints(filteredPoints);
      
      const savedProgress = localStorage.getItem('sessionProgress');
      const savedReviewed = localStorage.getItem('sessionReviewed');
      const savedIndex = localStorage.getItem('sessionCurrentIndex');

      if (savedProgress) setSessionProgress(parseInt(savedProgress));
      if (savedReviewed) setReviewed(new Set(JSON.parse(savedReviewed)));
      if (savedIndex && parseInt(savedIndex) < filteredPoints.length) {
        setCurrentIndex(parseInt(savedIndex));
      } else {
        setCurrentIndex(0);
      }
    } else {
      router.push('/');
    }
  }, [initialPoints, mode, item, router]);

  const handleCardFlip = () => {
    if (!points[currentIndex]) return;
    
    const pointId = points[currentIndex].id;
    if (!reviewed.has(pointId)) {
      const newReviewed = new Set(reviewed);
      newReviewed.add(pointId);
      setReviewed(newReviewed);
      
      const newProgress = Math.round((newReviewed.size / points.length) * 100);
      setSessionProgress(newProgress);

      localStorage.setItem('sessionProgress', newProgress.toString());
      localStorage.setItem('sessionReviewed', JSON.stringify([...newReviewed]));
      localStorage.setItem('sessionCurrentIndex', currentIndex.toString());
    }
  };

  const handleMeridianSelect = (meridian: string) => {
    setSelectedMeridian(meridian);
    router.push(`/session?mode=meridian&item=${encodeURIComponent(meridian)}`);
  };

  const currentPoint = useMemo(() => {
    const point = points[currentIndex];
    if (!point) return null;
    
    const nextPoint = points[currentIndex + 1];
    const prevPoint = points[currentIndex - 1];
    
    // Ensure pointNumber is always defined
    if (!point.pointNumber) {
      point.pointNumber = point.id; // Use ID as fallback if pointNumber is undefined
    }
    
    return {
      ...point,
      nextId: nextPoint?.id,
      nextAudio: nextPoint?.audio,
      prevId: prevPoint?.id,
      prevAudio: prevPoint?.audio
    } as FlashcardPoint;
  }, [currentIndex, points]);

  if (mode === 'meridian' && !selectedMeridian) {
    return (
      <div className="meridian-list">
        {MERIDIANS.map(meridian => (
          <button
            key={meridian}
            className="meridian-button"
            onClick={() => handleMeridianSelect(meridian)}
          >
            {meridian}
          </button>
        ))}
      </div>
    );
  }

  if (points.length === 0 || !points[currentIndex]) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-[var(--gold-primary)] font-serif">Loading points...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Progress bar */}
      <div className="session-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${sessionProgress}%` }}
          />
        </div>
        <div className="progress-text">
          {sessionProgress}% Complete
        </div>
      </div>

      {/* Flashcard */}
      {currentPoint && (
        <FlashCard
          point={currentPoint}
          sessionMode={mode}
          sessionItem={item}
          onFlip={handleCardFlip}
        />
      )}

      {/* Navigation buttons */}
      <div className="flex gap-4 w-full max-w-md mx-auto mt-8">
        <button
          onClick={() => setCurrentIndex(i => (i === 0 ? points.length - 1 : i - 1))}
          className="flex-1 bg-[var(--button-bg)] border-2 border-[var(--gold-primary)] text-[var(--gold-primary)] px-6 py-2 rounded-xl font-serif shadow-lg hover:bg-[var(--button-hover-bg)] transition-colors"
        >
          PREVIOUS
        </button>
        <button
          onClick={() => setCurrentIndex(i => (i === points.length - 1 ? 0 : i + 1))}
          className="flex-1 bg-[var(--gold-primary)] text-black px-6 py-2 rounded-xl font-serif shadow-lg hover:bg-[var(--gold-hover)] transition-colors"
        >
          NEXT
        </button>
      </div>

      {/* Exit button */}
      <div className="text-center mt-6">
        <button
          onClick={() => router.push('/')}
          className="text-[var(--gold-primary)] text-sm hover:underline font-serif"
        >
          Exit Session
        </button>
      </div>
    </div>
  );
}
