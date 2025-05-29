import { MeridianPoint3 } from '../types/points';

/**
 * Checks if a point's location description indicates it appears on both sides
 */
export function hasDualLocations(point: MeridianPoint3): boolean {
  if (!point.location) return false;
  
  const location = point.location.toLowerCase();
  const dualIndicators = [
    'bilateral',
    'both sides',
    'each side',
    'either side',
    'left and right',
    'right and left',
    'bilaterally'
  ];
  
  return dualIndicators.some(indicator => location.includes(indicator));
}

/**
 * Get regions where a point appears based on its location description
 */
export function getPointRegions(point: MeridianPoint3): string[] {
  const regions = new Set<string>();
  const location = point.location.toLowerCase();

  // Map location keywords to regions
  const regionKeywords: Record<string, string[]> = {
    head: ['head', 'face', 'scalp', 'temple', 'forehead', 'eye', 'ear', 'nose', 'mouth', 'cheek', 'jaw'],
    neck: ['neck', 'throat', 'cervical'],
    arms: ['arm', 'shoulder', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'forearm', 'axilla'],
    torso: ['chest', 'thorax', 'rib', 'breast', 'abdomen', 'belly', 'back', 'spine', 'lumbar', 'sacral', 'scapula', 'thoracic'],
    legs: ['leg', 'thigh', 'knee', 'calf', 'shin', 'fibula', 'tibia', 'patella'],
    feet: ['foot', 'ankle', 'heel', 'toe', 'malleolus', 'plantar']
  };

  // Check each region's keywords against the location
  Object.entries(regionKeywords).forEach(([region, keywords]) => {
    if (keywords.some(keyword => location.includes(keyword))) {
      regions.add(region);
    }
  });

  return Array.from(regions);
}

/**
 * Checks if a point is visible from a particular view (front/back)
 */
export function getPointViews(point: MeridianPoint3): ('front' | 'back' | 'both')[] {
  const location = point.location.toLowerCase();
  
  const frontIndicators = [
    'anterior',
    'ventral',
    'front',
    'chest',
    'abdomen',
    'belly'
  ];
  
  const backIndicators = [
    'posterior',
    'dorsal',
    'back',
    'spine',
    'vertebra',
    'lumbar',
    'sacral',
    'thoracic'
  ];
  
  const isFront = frontIndicators.some(indicator => location.includes(indicator));
  const isBack = backIndicators.some(indicator => location.includes(indicator));
  
  if (isFront && isBack) return ['both'];
  if (isFront) return ['front'];
  if (isBack) return ['back'];
  
  // If no clear indicators, assume both views
  return ['both'];
}
