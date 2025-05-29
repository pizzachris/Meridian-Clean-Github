import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import points from '../../data/points.json';
import { regionData } from '../../data/regionMap';
import { meridianColors } from '../../data/meridians';
import { MeridianPoint3 } from '../../types/points';
import MeridianColorToggle from '../ui/MeridianColorToggle';
import PointMarker from './PointMarker';
import Image from 'next/image';

// Known region keys
const regions = [
  { key: 'head', label: 'HEAD & NECK' },
  { key: 'arms', label: 'ARMS' },
  { key: 'torso', label: 'TORSO' },
  { key: 'legs', label: 'LEGS' },
  { key: 'feet', label: 'FEET' },
];

// Map of region keywords for intelligent region matching
const regionMap: Record<string, string[]> = {
  head: ['head', 'neck', 'face'],
  arms: ['arm', 'hand', 'shoulder', 'elbow', 'wrist', 'finger'],
  torso: ['chest', 'abdomen', 'back', 'trunk', 'waist', 'rib', 'spine', 'stomach'],
  legs: ['leg', 'thigh', 'knee', 'calf'],
  feet: ['foot', 'toe', 'ankle'],
};

const BodyMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isBackView, setIsBackView] = useState(false);
  const [activeMeridians, setActiveMeridians] = useState<Set<string>>(new Set(Object.keys(meridianColors)));
  const [highlightedPoint, setHighlightedPoint] = useState<string | null>(null);
  const router = useRouter();

  // Toggle individual meridian visibility
  const toggleMeridian = useCallback((meridian: string) => {
    setActiveMeridians(current => {
      const next = new Set(current);
      if (next.has(meridian)) {
        next.delete(meridian);
      } else {
        next.add(meridian);
      }
      return next;
    });
  }, []);

  // Toggle all meridians on/off
  const toggleAllMeridians = useCallback((state: boolean) => {
    setActiveMeridians(new Set(state ? Object.keys(meridianColors) : []));
  }, []);

  // Get color for a point, considering meridian state
  const getPointColor = useCallback((pointId: string) => {
    const meridian = pointId.slice(0, 2).toLowerCase();
    if (meridian in meridianColors && activeMeridians.has(meridian)) {
      return meridianColors[meridian].color;
    }
    return 'rgba(209, 168, 64, 0.3)'; // semi-transparent gold for inactive points
  }, [activeMeridians]);

  // Handle point selection
  const handlePointSelect = useCallback((pointId: string) => {
    setHighlightedPoint(pointId);
    router.push(`/points/${pointId}`);
  }, [router]);

  // Import location utilities
  const { hasDualLocations, getPointViews } = require('../../utils/locationUtils');

  // Check if a point has dual locations and get its views
  const getPointDisplay = useCallback((point: MeridianPoint3) => {
    const isDual = hasDualLocations(point);
    const views = getPointViews(point);
    const isVisible = views.includes('both') || 
                     (isBackView ? views.includes('back') : views.includes('front'));
    
    return { isDual, isVisible };
  }, [isBackView]);

  // Get image source based on view and region
  const getImageSrc = useCallback((region: string | null, isBack: boolean): string => {
    if (!region) {
      return isBack ? '/images/body-back.png' : '/images/body-front.png';
    }

    const regionInfo = regionData[region];
    if (isBack && regionInfo?.backImage) {
      return regionInfo.backImage;
    }
    return regionInfo?.image || '';
  }, []);

  // Render points for the current view and region
  const renderPoints = () => {
    if (!selectedRegion || !regionData[selectedRegion]) return null;

    const regionPoints = regionData[selectedRegion].points || [];
    return regionPoints.map(regionPoint => {
      const point = points.find((p: MeridianPoint3) => p.id === regionPoint.id);
      if (!point) return null;

      const { isDual, isVisible: isViewVisible } = getPointDisplay(point);
      const isMeridianActive = activeMeridians.has(point.meridian.toLowerCase());
      
      if (!isViewVisible || (!isMeridianActive && highlightedPoint !== point.id)) {
        return null;
      }
        
      return (
        <PointMarker
          key={point.id}
          point={point}
          color={getPointColor(point.id)}
          onClick={handlePointSelect}
          position={{
            top: regionPoint.top,
            left: regionPoint.left
          }}
          isMirrored={isDual}
          isHighlighted={point.id === highlightedPoint}
          data-testid="point-marker"
        />
      );
    });
  };

  const [announceMessage, setAnnounceMessage] = useState<string>('');

  // Handle region selection with announcement
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setAnnounceMessage(`${region} region selected`);
  };

  return (
    <div 
      className="body-map-container"
      data-testid="body-map"
      data-view={isBackView ? 'back' : 'front'}
    >
      <div className="meridian-controls mb-6">
        <MeridianColorToggle 
          activeMeridians={activeMeridians} 
          onToggle={toggleMeridian}
          onToggleAll={toggleAllMeridians}
        />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          {!selectedRegion ? (
            <>
              <h1 className="text-[var(--gold-primary)] text-2xl font-bold font-serif mb-8 text-center">
                <span className="block text-base mb-1">EXPLORE</span>
                BODY MAP
              </h1>
              <div className="relative w-[320px] h-[480px] mb-4">
                <Image
                  src={getImageSrc(null, isBackView)}
                  alt="Body Map"
                  layout="fill"
                  objectFit="contain"
                  priority
                  className="select-none"
                />
                <div className="absolute inset-0">
                  {regions.map(region => (
                    <button
                      key={region.key}
                      onClick={() => handleRegionSelect(region.key)}
                      className={`absolute cursor-pointer hover:opacity-75 transition-opacity ${
                        selectedRegion === region.key ? 'selected' : ''
                      }`}
                      style={{
                        ...regionData[region.key].area,
                        position: 'absolute'
                      }}
                      data-testid={`region-${region.key}`}
                      aria-label={region.label}
                      role="button"
                    >
                      <span className="sr-only">{region.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative w-[320px] h-[480px]">
                <Image
                  src={getImageSrc(selectedRegion, isBackView)}
                  alt={`${selectedRegion} region`}
                  layout="fill"
                  objectFit="contain"
                  priority
                  className="select-none"
                />
                {renderPoints()}
              </div>
              <div className="flex flex-col gap-4 mt-6">
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="button"
                >
                  BACK TO MAP
                </button>
                {regionData[selectedRegion]?.backImage && (
                  <button
                    onClick={() => setIsBackView(!isBackView)}
                    className="button"
                    aria-label="toggle view"
                  >
                    {isBackView ? "SHOW FRONT VIEW" : "SHOW BACK VIEW"}
                  </button>
                )}
              </div>
            </>
          )}
          {announceMessage && (
            <div role="alert" className="sr-only">
              {announceMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyMap;
