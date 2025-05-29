// This script transforms the provided workbook JSON into the flat array format for Meridian Mastery app
// Run with: ts-node transform_workbook.ts (after placing this file in the project root)
import fs from 'fs';

// Load the workbook
const workbook = JSON.parse(fs.readFileSync('../Meridian_Mastery_FULL_WORKBOOK_FINAL_REVIEW.json', 'utf8'));

// Helper to normalize meridian code (e.g., "Lung (LU)" => "LU")
function extractMeridianCode(meridianName: string): string {
  const match = meridianName.match(/\(([^)]+)\)/);
  return match ? match[1] : meridianName.split(' ')[0];
}

// Helper to build unique id (e.g., "LU3")
function buildId(pointNumber: string, meridian: string): string {
  if (!pointNumber) return meridian.replace(/[^A-Z0-9]/gi, '');
  return pointNumber.match(/^[A-Z]+\d+$/) ? pointNumber : `${extractMeridianCode(meridian)}${pointNumber.replace(/[^\d]/g, '')}`;
}

// Flatten the "All Points (Master)" array
const points = workbook['All Points (Master)'].map((pt: any) => ({
  id: buildId(pt['Point Number'], pt['Meridian Name']),
  korean: pt['Korean Name (Hangul)'] || '',
  romanized: pt['Romanized Korean'] || '',
  english: pt['English Translation (Verified)'] || '',
  meridian: extractMeridianCode(pt['Meridian Name']),
  pointNumber: pt['Point Number'] || '',
  location: pt['Anatomical Location'] || '',
  region: '', // Can be filled in later if region logic is needed
  healing: pt['Healing Function'] || '',
  martial: pt['Martial Application'] || '',
  dualMeridian: false, // Can be set with additional logic if needed
  symptoms: [], // Can be filled in later if symptom mapping is available
  audio: '', // Can be filled in later if audio mapping is available
  notes: pt['Shared Name Indicator'] || '',
  observed: pt['Observed'] || '',
  theoretical: pt['Theoretical'] || ''
}));

// Write to points.json
fs.writeFileSync('./Meridian Mastery/src/data/points.json', JSON.stringify(points, null, 2));

console.log(`Transformed ${points.length} points to points.json`);
