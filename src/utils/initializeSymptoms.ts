import { extractSymptomsFromHealing } from './symptomMapping';
import points from '../data/points.json';

export function initializePointSymptoms() {
  console.log('Initializing symptoms for points...');
  let totalExtractedSymptoms = 0;
  
  const initializedPoints = points.map(point => {
    try {
      const extractedSymptoms = extractSymptomsFromHealing(point.healing);
      totalExtractedSymptoms += extractedSymptoms.length;
      
      const combinedSymptoms = Array.from(new Set([
        ...(point.symptoms || []),
        ...extractedSymptoms
      ]));
      
      if (combinedSymptoms.length > 0) {
        console.log(`Point ${point.id}: Found ${extractedSymptoms.length} symptoms from healing text`);
      }
      
      return {
        ...point,
        symptoms: combinedSymptoms
      };
    } catch (error) {
      console.error(`Error processing point ${point.id}:`, error);
      return point;
    }
  });
  
  console.log(`Initialization complete. Total extracted symptoms: ${totalExtractedSymptoms}`);
  return initializedPoints;
}

// Initialize symptoms when importing the points
const pointsWithSymptoms = initializePointSymptoms();
export default pointsWithSymptoms;
