import { MeridianPoint3 } from '../types/points';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePointInput(point: Partial<MeridianPoint3>): ValidationResult {
  const errors: string[] = [];

  // Required fields check
  const requiredFields: (keyof MeridianPoint3)[] = [
    'id', 'korean', 'romanized', 'english', 'meridian', 'pointNumber', 'location'
  ];

  for (const field of requiredFields) {
    if (!point[field]?.toString().trim()) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Point ID format validation
  if (point.id && !/^[A-Z]{2,3}\d{1,3}$/.test(point.id)) {
    errors.push('Invalid point ID format. Expected format: [Meridian Code][Number] (e.g., ST36, LI4)');
  }

  // Location string sanitization and validation
  if (point.location) {
    // Remove potential HTML/script injection
    const sanitizedLocation = point.location
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\s.,()/-]/g, '');
    
    // Check if essential location information is present
    if (!sanitizedLocation.match(/(cun|寸|inch|cm|mm|lateral|medial|proximal|distal|superior|inferior)/)) {
      errors.push('Location must include measurement references');
    }
    if (!sanitizedLocation.match(/(bone|muscle|tendon|ligament|joint|nerve|artery|vein|depression|border|eminence|notch|process|spine|tuberosity|malleolus|epicondyle)/)) {
      errors.push('Location must include anatomical landmarks');
    }
  }

  // Korean text validation
  if (point.korean && !/^[가-힣\s]+$/.test(point.korean)) {
    errors.push('Korean name must contain only Hangul characters');
  }

  // Roman numeral validation in point number
  if (point.pointNumber && /[IVX]+/.test(point.pointNumber) && !/^[IVX]+$/.test(point.pointNumber.replace(/\d/g, ''))) {
    errors.push('Invalid Roman numerals in point number');
  }

  // Validate symptoms array format
  if (point.symptoms && !Array.isArray(point.symptoms)) {
    errors.push('Symptoms must be an array of strings');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizePointInput(point: MeridianPoint3): MeridianPoint3 {
  return {
    ...point,
    // Trim all string fields and convert empty strings to undefined
    id: point.id?.trim(),
    korean: point.korean?.trim(),
    romanized: point.romanized?.trim(),
    english: point.english?.trim(),
    meridian: point.meridian?.trim(),
    pointNumber: point.pointNumber?.trim(),
    location: point.location?.trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s.,()/-]/g, ''), // Remove special characters except basic punctuation
    healing: point.healing?.trim(),
    martial: point.martial?.trim(),
    region: point.region?.trim().toLowerCase(),
    notes: point.notes?.trim(),
    // Ensure symptoms is always an array
    symptoms: Array.isArray(point.symptoms) ? 
      point.symptoms.map(s => s.trim()).filter(Boolean) : 
      [],
    audio: point.audio?.trim(),
    dualMeridian: Boolean(point.dualMeridian)
  };
}
