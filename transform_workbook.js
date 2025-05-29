// transform_workbook.js: Node.js script to convert the workbook JSON to points.json for the app
const fs = require('fs');

// Load the workbook
const workbook = JSON.parse(fs.readFileSync('Meridian_Mastery_FULL_WORKBOOK_FINAL_REVIEW.json', 'utf8'));

function extractMeridianCode(meridianName) {
  const match = meridianName.match(/\(([^)]+)\)/);
  return match ? match[1] : meridianName.split(' ')[0];
}

function buildId(pointNumber, meridian) {
  if (!pointNumber) return meridian.replace(/[^A-Z0-9]/gi, '');
  return pointNumber.match(/^[A-Z]+\d+$/) ? pointNumber : `${extractMeridianCode(meridian)}${pointNumber.replace(/[^\d]/g, '')}`;
}

const points = workbook['All Points (Master)'].map(pt => ({
  id: buildId(pt['Point Number'], pt['Meridian Name']),
  korean: pt['Korean Name (Hangul)'] || '',
  romanized: pt['Romanized Korean'] || '',
  english: pt['English Translation (Verified)'] || '',
  meridian: extractMeridianCode(pt['Meridian Name']),
  pointNumber: pt['Point Number'] || '',
  location: pt['Anatomical Location'] || '',
  region: '',
  healing: pt['Healing Function'] || '',
  martial: pt['Martial Application'] || '',
  dualMeridian: false,
  symptoms: [],
  audio: '',
  notes: pt['Shared Name Indicator'] || '',
  observed: pt['Observed'] || '',
  theoretical: pt['Theoretical'] || ''
}));

fs.writeFileSync('Meridian Mastery/src/data/points.json', JSON.stringify(points, null, 2));

console.log(`Transformed ${points.length} points to Meridian Mastery/src/data/points.json`);
