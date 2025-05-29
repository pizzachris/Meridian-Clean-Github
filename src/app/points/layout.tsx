'use client';


import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import points from '../../data/points.json';
import Link from 'next/link';
import type { MeridianPoint3 } from '../../types/points';

export default function PointsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id?: string };
}) {
  const router = useRouter();  

  const [currentPoint, setCurrentPoint] = useState<MeridianPoint3 | null>(null);
  const [nextPoint, setNextPoint] = useState<MeridianPoint3 | null>(null);
  const [prevPoint, setPrevPoint] = useState<MeridianPoint3 | null>(null);

  useEffect(() => {
    if (!params.id) {
      setCurrentPoint(null);
      setNextPoint(null);
      setPrevPoint(null);
      return;
    }
    const index = points.findIndex((p: MeridianPoint3) => p.id === params.id);
    if (index > -1) {
      setCurrentPoint(points[index]);
      setNextPoint(points[index + 1] || null);
      setPrevPoint(points[index - 1] || null);
    } else {
      setCurrentPoint(null);
      setNextPoint(null);
      setPrevPoint(null);
    }
  }, [params?.id]);

  if (!params.id || !currentPoint) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-app py-8">
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="button"
          >
            ← Back to Map
          </button>
          <div className="flex gap-2">
            {prevPoint && (
              <Link href={`/points/${prevPoint.id}`} className="button">
                ← Previous
              </Link>
            )}
            {nextPoint && (
              <Link href={`/points/${nextPoint.id}`} className="button">
                Next →
              </Link>
            )}
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
