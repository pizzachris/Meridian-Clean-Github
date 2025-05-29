import { NextResponse } from 'next/server';
import points from '../../../../data/points.json';
import { headers } from 'next/headers';

const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const rateLimit = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true;
  }
  
  rateLimit.set(ip, [...recentRequests, now]);
  return false;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {  try {
    // Get client IP
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    const point = points.find(p => p.id === params.id);
    
    if (!point) {
      return NextResponse.json(
        { error: 'Point not found' },
        { status: 404 }
      );
    }

    // Generate a meaningful insight based on the point's properties
    const aspects = [];
    
    if (point.healing && point.martial) {
      aspects.push('This point demonstrates the duality of meridian theory, serving both healing and martial purposes.');
    }

    if (point.dualMeridian) {
      aspects.push('As a dual meridian point, it connects multiple energy pathways, increasing its significance.');
    }

    if (point.location) {
      aspects.push(`Located at ${point.location}, precision is crucial for both therapeutic and protective applications.`);
    }

    if (point.healing) {
      aspects.push(`Its primary healing properties include: ${point.healing}`);
    }

    if (point.martial) {
      aspects.push(`In martial contexts, ${point.martial.toLowerCase()}`);
    }

    if (point.symptoms && point.symptoms.length > 0) {
      aspects.push(`Common symptoms addressed include: ${point.symptoms.join(', ')}.`);
    }

    if (point.notes) {
      aspects.push(point.notes);
    }

    if (point.observed) {
      aspects.push(`Observed effects: ${point.observed}`);
    }

    if (point.theoretical) {
      aspects.push(`Theoretical applications: ${point.theoretical}`);
    }

    const insight = aspects.join(' ');

    // Return response with caching headers
    return NextResponse.json(
      { insight },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': (RATE_LIMIT - (rateLimit.get(ip)?.length || 0)).toString()
        }
      }
    );
  } catch (error) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
