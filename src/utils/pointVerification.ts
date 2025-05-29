import { MeridianPoint3 } from '../types/points';
import { ValidationCache } from './validation-cache';

export interface VerificationResult {
  id: string;
  status: 'complete' | 'incomplete';
  hasMeasurements: boolean;
  hasLandmarks: boolean;
  hasView: boolean;
  regions: string[];
  isBilateral: boolean;
  issues: string[];
}

export interface VerificationStats {
  total: number;
  complete: number;
  bilateral: number;
  byRegion: {
    head: number;
    arms: number;
    trunk: number;
    legs: number;
    feet: number;
    unassigned: number;
  };
  byView: {
    front: number;
    back: number;
    both: number;
    unspecified: number;
  };
}

// Initialize validation cache
const verificationCache = new ValidationCache<VerificationResult>({
  maxAge: 30 * 60 * 1000, // 30 minutes
  maxSize: 1000 // Cache up to 1000 point verifications
});

const statsCache = new ValidationCache<VerificationStats>({
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 1 // Only cache the latest stats
});

export function verifyPoint(point: MeridianPoint3): VerificationResult {
  // Check cache first
  const cacheKey = `${point.id}-${point.location}`;
  const cachedResult = verificationCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const result: VerificationResult = {
    id: point.id,
    status: 'incomplete',
    hasMeasurements: false,
    hasLandmarks: false,
    hasView: false,
    regions: [],
    isBilateral: false,
    issues: []
  };

  if (!point.location?.trim()) {
    result.issues.push('Missing location description');
    verificationCache.set(cacheKey, result);
    return result;
  }

  const loc = point.location.toLowerCase();

  // Check measurements
  if (loc.match(/(cun|寸|inch|cm|mm|lateral|medial|proximal|distal|superior|inferior)/)) {
    result.hasMeasurements = true;
  } else {
    result.issues.push('Missing measurement references');
  }

  // Check anatomical landmarks
  if (loc.match(/(bone|muscle|tendon|ligament|joint|nerve|artery|vein|depression|border|eminence|notch|process|spine|tuberosity|malleolus|epicondyle)/)) {
    result.hasLandmarks = true;
  } else {
    result.issues.push('Missing anatomical landmarks');
  }

  // Check bilateral indicators
  if (loc.match(/(bilateral|both sides|either side|left and right)/i)) {
    result.isBilateral = true;
  }

  // Check views
  let hasView = false;
  if (loc.includes('anterior') || loc.includes('front') || loc.match(/(chest|abdomen|umbilicus|nipple|sternum)/)) {
    result.hasView = true;
    hasView = true;
  }
  if (loc.includes('posterior') || loc.includes('back') || loc.match(/(spine|scapula|vertebra|sacrum)/)) {
    result.hasView = true;
    hasView = true;
  }
  if (!hasView) {
    result.issues.push('View not specified (front/back)');
  }

  // Check regions
  if (loc.match(/(head|face|neck|skull|jaw|chin|eye|ear|nose|mouth|throat)/)) {
    result.regions.push('head');
  }
  if (loc.match(/(arm|shoulder|hand|finger|wrist|elbow|forearm|humerus|radius|ulna)/)) {
    result.regions.push('arms');
  }
  if (loc.match(/(chest|thorax|abdomen|back|spine|rib|waist|sternum|scapula|trapezius)/)) {
    result.regions.push('trunk');
  }
  if (loc.match(/(leg|thigh|knee|calf|shin|tibia|fibula|patella|femur|hamstring)/)) {
    result.regions.push('legs');
  }
  if (loc.match(/(foot|toe|ankle|heel|plantar|dorsum|malleolus)/)) {
    result.regions.push('feet');
  }

  if (result.regions.length === 0) {
    result.issues.push('Region not identifiable');
  }

  result.status = (result.hasMeasurements && result.hasLandmarks && result.hasView && result.regions.length > 0) 
    ? 'complete' 
    : 'incomplete';

  verificationCache.set(cacheKey, result);
  return result;
}

export function verifyAllPoints(points: MeridianPoint3[]): {results: VerificationResult[], stats: VerificationStats} {
  // Check stats cache first
  const cachedStats = statsCache.get('global');
  if (cachedStats) {
    const cachedResults = points.map(point => verificationCache.get(`${point.id}-${point.location}`));
    if (cachedResults.every(result => result !== undefined)) {
      return {
        results: cachedResults as VerificationResult[],
        stats: cachedStats
      };
    }
  }

  const stats: VerificationStats = {
    total: points.length,
    complete: 0,
    bilateral: 0,
    byRegion: {
      head: 0,
      arms: 0,
      trunk: 0,
      legs: 0,
      feet: 0,
      unassigned: 0
    },
    byView: {
      front: 0,
      back: 0,
      both: 0,
      unspecified: 0
    }
  };

  const results = points.map(point => {
    const result = verifyPoint(point);
    
    // Update stats
    if (result.status === 'complete') {
      stats.complete++;
    }
    if (result.isBilateral) {
      stats.bilateral++;
    }

    // Update region stats
    if (result.regions.length === 0) {
      stats.byRegion.unassigned++;
    } else {
      result.regions.forEach(region => {
        if (region in stats.byRegion) {
          stats.byRegion[region as keyof typeof stats.byRegion]++;
        }
      });
    }

    // Update view stats
    const loc = point.location?.toLowerCase() || '';
    if (loc.includes('anterior') || loc.includes('front')) {
      if (loc.includes('posterior') || loc.includes('back')) {
        stats.byView.both++;
      } else {
        stats.byView.front++;
      }
    } else if (loc.includes('posterior') || loc.includes('back')) {
      stats.byView.back++;
    } else {
      stats.byView.unspecified++;
    }

    return result;
  });
  // Cache the stats for next time
  statsCache.set('global', stats);
  return { results, stats };
}
