import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRateLimit } from './utils/rate-limit';

// Enhance environment configuration typing
type Environment = 'development' | 'staging' | 'production';
type Priority = 'high' | 'medium' | 'low';

// Security and configuration interfaces
interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Content-Security-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'X-Powered-By'?: string;
  'Permissions-Policy'?: string;
}

interface EnvConfig {
  cspHeader: string | undefined;
  poweredByHeader: string | undefined;
  hsts: string | undefined;
  additionalHeaders?: Record<string, string | null>;
}

interface PushResource {
  path: string;
  type: string;
  priority: Priority;
  weight: number;
}

const APP_ENV = (process.env.APP_ENV || 'development') as Environment;

// Enhanced security headers based on environment
const getSecurityHeaders = (env: Environment): SecurityHeaders => {
  const baseHeaders: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': env === 'development' ? 'SAMEORIGIN' : 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': env === 'development' ? 'no-referrer-when-downgrade' : 'strict-origin-when-cross-origin',
    'Cross-Origin-Opener-Policy': env === 'development' ? 'unsafe-none' : 'same-origin',
    'Cross-Origin-Embedder-Policy': env === 'development' ? 'unsafe-none' : 'require-corp',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  };

  const envConfig = ENV_CONFIGS[env];
  if (envConfig.cspHeader) {
    baseHeaders['Content-Security-Policy'] = envConfig.cspHeader;
  }
  if (envConfig.hsts) {
    baseHeaders['Strict-Transport-Security'] = envConfig.hsts;
  }
  if (envConfig.poweredByHeader) {
    baseHeaders['X-Powered-By'] = envConfig.poweredByHeader;
  }

  return baseHeaders;
};

// Environment configurations
const ENV_CONFIGS: Record<string, EnvConfig> = {
  production: {
    cspHeader:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "media-src 'self' blob:; " +
      "worker-src 'self' blob:; " +
      "connect-src 'self' https://www.google-analytics.com https://*.sentry.io; " +
      "manifest-src 'self'; " +
      "frame-ancestors 'none';" +
      "base-uri 'self';" +
      "form-action 'self';",
    poweredByHeader: undefined,
    hsts: 'max-age=31536000; includeSubDomains; preload',
    additionalHeaders: {
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Access-Control-Allow-Origin': null,
      'X-DNS-Prefetch-Control': 'on',
      'Expect-CT': 'max-age=86400, enforce',
      'Report-To': '{"group":"default","max_age":31536000,"endpoints":[{"url":"/api/csp-report"}],"include_subdomains":true}',
      'NEL': '{"report_to":"default","max_age":31536000,"include_subdomains":true}'
    }
  },
  staging: {
    cspHeader:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data:; " +
      "media-src 'self' blob:; " +
      "worker-src 'self' blob:; " +
      "connect-src 'self' https://*.sentry.io; " +
      "manifest-src 'self';",
    poweredByHeader: 'Meridian Mastery Staging',
    hsts: 'max-age=31536000; includeSubDomains',
    additionalHeaders: {
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'on'
    }
  },  development: {
    cspHeader: undefined,
    poweredByHeader: 'Meridian Mastery Dev',
    hsts: undefined,
    additionalHeaders: {
      'Access-Control-Allow-Origin': '*', // Allow CORS in development
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'X-DNS-Prefetch-Control': 'on'
    }
  }
};

const PUSH_MANIFEST: Record<string, PushResource[]> = {
  '/': [
    { path: '/_next/static/css/app.css', type: 'style', priority: 'high', weight: 1 },
    { path: '/logo.svg', type: 'image', priority: 'high', weight: 1 },
    { path: '/manifest.json', type: 'fetch', priority: 'low', weight: 0.5 },
    { path: '/api/health', type: 'fetch', priority: 'high', weight: 1 }
  ],
  '/session': [
    { path: '/_next/static/css/app.css', type: 'style', priority: 'high', weight: 1 },
    { path: '/api/insight/', type: 'fetch', priority: 'high', weight: 1 },
    { path: '/audio/', type: 'fetch', priority: 'medium', weight: 0.8 },
    { path: '/api/points/', type: 'fetch', priority: 'high', weight: 1 }
  ]
  // ...existing manifest entries...
};

// Improved middleware function
export async function middleware(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const response = NextResponse.next();
    const { pathname } = request.nextUrl;
    const headers = response.headers;

    // Apply security headers based on environment
    const securityHeaders = getSecurityHeaders(APP_ENV);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, value);
      }
    });

    // Handle resource hints and preloading
    if (PUSH_MANIFEST[pathname]) {
      const resources = PUSH_MANIFEST[pathname];
      const linkHeader = resources
        .map(resource => {
          const rel = resource.priority === 'high' ? 'preload' : 'prefetch';
          return `<${resource.path}>; rel=${rel}; as=${resource.type}; importance=${resource.priority}; weight=${resource.weight}`;
        })
        .join(', ');

      headers.set('Link', linkHeader);
      headers.set('Early-Hints', '103');
    }

    // Add optimized cache headers based on resource type
    if (pathname.startsWith('/api/')) {
      headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      headers.set('Vary', 'Accept, Accept-Encoding');
    } else if (pathname.startsWith('/audio/')) {
      headers.set('Cache-Control', 'public, max-age=604800, immutable');
      headers.set('Accept-Ranges', 'bytes');
    } else if (pathname.startsWith('/_next/static/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Vary', 'Accept-Encoding');
    }

    // Add content optimization headers
    headers.set('Accept-CH', 'DPR, Width, Viewport-Width');
    headers.set('Accept-CH-Lifetime', '86400');

    // Handle additional environment-specific headers
    const envConfig = ENV_CONFIGS[APP_ENV];
    if (envConfig.additionalHeaders) {
      Object.entries(envConfig.additionalHeaders).forEach(([key, value]) => {
        if (value === null) {
          headers.delete(key);
        } else {
          headers.set(key, value);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.next();
    const headers = response.headers;
    
    // Ensure essential security headers are set even in error cases
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }
}

// Configure which routes will trigger the middleware
export const config = {
  matcher: [
    '/((?!_next/static|.*\\.(?:jpg|jpeg|gif|png|svg|ico)$).*)'
  ]
};
