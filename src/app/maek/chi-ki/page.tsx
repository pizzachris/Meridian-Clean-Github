'use client';

import { useEffect, useState } from 'react';
import MaekPage from '../../../components/maek/MaekPage';
import points from '../../../data/points.json';
import { MeridianPoint3 } from '../../../types/points';

export default function MaekChiKiPage() {
  const [progress, setProgress] = useState(0);
  const [chiKiPoints, setChiKiPoints] = useState<MeridianPoint3[]>([]);

  useEffect(() => {
    // Filter points for Chi Ki and get progress from localStorage
    const filteredPoints = points.filter((p: MeridianPoint3) => p.id.startsWith('MchK'));
    setChiKiPoints(filteredPoints);

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chi-ki-progress');
      const progressValue = saved ? Math.floor((JSON.parse(saved).completed / filteredPoints.length) * 100) : 0;
      setProgress(progressValue);
    }
  }, []);

  return <MaekPage type="chi-ki" points={chiKiPoints} progress={progress} />;
}
