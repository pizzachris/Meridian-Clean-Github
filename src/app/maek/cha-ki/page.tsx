'use client';

import { useEffect, useState } from 'react';
import MaekPage from '../../../components/maek/MaekPage';
import points from '../../../data/points.json';
import { MeridianPoint3 } from '../../../types/points';

export default function MaekChaKiPage() {
  const [progress, setProgress] = useState(0);
  const [chaKiPoints, setChaKiPoints] = useState<MeridianPoint3[]>([]);

  useEffect(() => {
    // Filter points for Cha Ki and get progress from localStorage
    const filteredPoints = points.filter((p: MeridianPoint3) => p.id.startsWith('MCK'));
    setChaKiPoints(filteredPoints);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cha-ki-progress');
      const progressValue = saved ? Math.floor((JSON.parse(saved).completed / filteredPoints.length) * 100) : 0;
      setProgress(progressValue);
    }
  }, []);

  return <MaekPage type="cha-ki" points={chaKiPoints} progress={progress} />;
}
