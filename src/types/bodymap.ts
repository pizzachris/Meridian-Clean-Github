export interface BodyMapPoint {
  id: string;
  top: string;
  left: string;
  view?: 'front' | 'back';
}

export interface RegionArea {
  top: string;
  left: string;
  width: string;
  height: string;
}

export interface RegionData {
  title: string;
  image: string;
  backImage?: string;
  area: RegionArea;
  points: BodyMapPoint[];
}

export type RegionKey = 'head' | 'arms' | 'trunk' | 'legs' | 'feet';

export interface RegionDataMap {
  [key: string]: RegionData;
}
