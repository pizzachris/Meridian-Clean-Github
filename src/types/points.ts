export interface MeridianPoint3 {
  id: string; // Unique identifier (e.g., "LU3", "MCK1")
  korean: string;
  romanized: string;
  english: string;
  meridian: string;
  pointNumber?: string;
  location: string;
  region?: string;
  healing: string;
  martial: string;
  dualMeridian?: boolean;
  symptoms?: string[];
  audio?: string;
  notes?: string;
  observed?: string;
  theoretical?: string;
}

export interface FlashcardPoint extends MeridianPoint3 {
  nextId?: string;
  nextAudio?: string;
  prevId?: string;
  prevAudio?: string;
}