import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  customHeaders?: Record<string, string>;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// In-memory store for rate limiting (consider using Redis for production)
const requestStore = new Map<string, RateLimitInfo>();

// Rate limit configurations for different endpoints
const rateLimits: Record<string, RateLimitConfig> = {
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    message: 'Too many requests. Please try again later.'
  },
  '/api/insight': {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Rate limit exceeded for insights API. Please wait before requesting more insights.',
    customHeaders: {
      'X-RateLimit-Resource': 'insights'
    }
  },
  '/api/points': {
    windowMs: 60 * 1000,
    maxRequests: 50,
    message: 'Rate limit exceeded for points API. Please wait before requesting more points.',
    customHeaders: {
      'X-RateLimit-Resource': 'points'
    }
  }
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime <= now) {
      requestStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function applyRateLimit(req: NextRequest): NextResponse | undefined {
  // Get client identifier with fallbacks
  const clientId = req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') ||
                  req.headers.get('x-real-ip') ||
                  'unknown';
                  
  const path = req.nextUrl.pathname;
  
  // Find matching rate limit configuration
  const config = Object.entries(rateLimits)
    .find(([key]) => path.startsWith(key))?.[1] || rateLimits.default;

  const now = Date.now();
  const key = `${clientId}:${path}`;
  const currentRequest = requestStore.get(key);

  // Base headers for all responses
  const headers = new Headers({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Window': (config.windowMs / 1000).toString(),
    ...config.customHeaders
  });

  if (!currentRequest || currentRequest.resetTime <= now) {
    // First request or window expired
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      firstRequest: now
    });

    headers.set('X-RateLimit-Remaining', (config.maxRequests - 1).toString());
    headers.set('X-RateLimit-Reset', (now + config.windowMs).toString());
    
    return undefined;
  }

  // Calculate remaining requests and time
  const remaining = Math.max(0, config.maxRequests - currentRequest.count);
  const reset = currentRequest.resetTime;
  const retryAfter = Math.ceil((reset - now) / 1000);

  // Update headers with current values
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', reset.toString());

  // Increment request count
  currentRequest.count++;

  // Check if limit exceeded
  if (currentRequest.count > config.maxRequests) {
    headers.set('Retry-After', retryAfter.toString());
    
    return new NextResponse(JSON.stringify({
      error: config.message || 'Too many requests',
      retryAfter,
      limit: config.maxRequests,
      remaining: 0,
      reset
    }), {
      status: 429,
      headers: headers,
      statusText: 'Too Many Requests'
    });
  }

  // Attach rate limit headers to successful response
  return new NextResponse(undefined, { headers });
}
