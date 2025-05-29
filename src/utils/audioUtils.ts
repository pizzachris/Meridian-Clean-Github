import points from '../data/points.json';
import { MeridianPoint3 } from '../types/points';

// Function to batch update audio paths in points data
export async function updateAudioPaths() {
  const updatedPoints = points.map((point: MeridianPoint3) => {
    // Generate standardized audio filename based on point ID
    const audioPath = `audio/${point.meridian.toLowerCase()}/${point.id.toLowerCase()}.mp3`;
    return {
      ...point,
      audio: audioPath
    };
  });

  return updatedPoints;
}

// Function to verify audio existence
export async function verifyAudioFiles() {
  const missingAudio: string[] = [];
  
  for (const point of points) {
    if (point.audio) {
      try {
        const response = await fetch(`/${point.audio}`);
        if (!response.ok) {
          missingAudio.push(point.id);
        }
      } catch {
        missingAudio.push(point.id);
      }
    } else {
      missingAudio.push(point.id);
    }
  }

  return missingAudio;
}
