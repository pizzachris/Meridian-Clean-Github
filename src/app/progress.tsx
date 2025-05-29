import ProgressTracker from '../components/progress/ProgressTracker';
import points from '../data/points.json';
import React, { useEffect, useState } from 'react';

function getTodayKey() {
  const today = new Date();
  return `progress-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export default function ProgressPage() {
  const [reviewed, setReviewed] = useState<number[]>([]);
  const [daily, setDaily] = useState<number>(0);
  const [meridianProgress, setMeridianProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reviewed');
      setReviewed(saved ? JSON.parse(saved) : []);
      const todayKey = getTodayKey();
      setDaily(Number(localStorage.getItem(todayKey) || 0));
      
      // Calculate meridian progress
      const meridianMap: {[key: string]: Set<number>} = {};
      reviewed.forEach(idx => {
        const pt = points[idx];
        if (!pt) return;
        if (!meridianMap[pt.meridian]) meridianMap[pt.meridian] = new Set();
        meridianMap[pt.meridian].add(idx);
      });
      const meridianCounts: {[key: string]: number} = {};
      Object.keys(meridianMap).forEach(m => {
        meridianCounts[m] = meridianMap[m].size;
      });
      setMeridianProgress(meridianCounts);
    }
  }, [reviewed]);

  // Calculate total meridians
  const allMeridians = Array.from(new Set(points.map(p => p.meridian)));
  const completedMeridians = allMeridians.filter(m => {
    const total = points.filter(p => p.meridian === m).length;
    return meridianProgress[m] === total && total > 0;
  });

  return (
    <main className="min-h-screen bg-black flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <img src="/logo.svg" alt="Meridian Mastery" className="w-20 h-20 mb-4" />
        <h1 className="text-[var(--gold-primary)] text-2xl font-serif font-bold">PROGRESS</h1>
      </div>

      {/* Progress Trackers */}
      <div className="w-full max-w-md flex flex-col gap-6">
        <ProgressTracker 
          label="Daily Sessions" 
          current={daily} 
          total={21} 
          category="daily"
        />
        <ProgressTracker 
          label="Meridians" 
          current={completedMeridians.length} 
          total={allMeridians.length} 
          category="meridians"
        />
        <ProgressTracker 
          label="Maek Chi Ki / Cha Ki" 
          current={reviewed.length} 
          total={30} 
          category="maek"
        />
      </div>

      {/* Tagline */}
      <div className="mt-10 text-[var(--gold-primary)] font-serif text-lg text-center">
        Progress comes with practice.
      </div>
    </main>
  );
}
