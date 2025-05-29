import { middleware } from '../middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

describe('Middleware', () => {
  let mockRequest: NextRequest;
  let mockNextResponse: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      nextUrl: { pathname: '/' },
    } as unknown as NextRequest;

    mockNextResponse = jest.spyOn(NextResponse, 'next').mockImplementation(() => {
      return new NextResponse(null, {
        headers: new Headers(),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds HTTP/2 server push headers for home page', async () => {
    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Link')).toContain('</logo.svg>; rel=preload; as=image');
    expect(headers.get('Early-Hints')).toBe('103');
  });

  it('adds correct cache headers for API routes', async () => {
    mockRequest = {
      nextUrl: { pathname: '/api/insight/test' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Cache-Control')).toBe(
      'public, max-age=86400, stale-while-revalidate=604800'
    );
  });

  it('adds correct cache headers for audio files', async () => {
    mockRequest = {
      nextUrl: { pathname: '/audio/test.mp3' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Cache-Control')).toBe(
      'public, max-age=604800, immutable'
    );
  });
  it('adds cross-origin isolation headers', async () => {
    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
  });

  it('adds security headers', async () => {
    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toBe('accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  });

  it('adds content optimization headers', async () => {
    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Accept-CH')).toBe('DPR, Width, Viewport-Width');
    expect(headers.get('Accept-CH-Lifetime')).toBe('86400');
  });

  it('adds correct cache headers for static files', async () => {
    mockRequest = {
      nextUrl: { pathname: '/_next/static/chunks/main.js' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(headers.get('Vary')).toBe('Accept-Encoding');
  });

  it('adds Accept-Ranges header for audio files', async () => {
    mockRequest = {
      nextUrl: { pathname: '/audio/test.mp3' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Accept-Ranges')).toBe('bytes');
  });

  it('adds Vary header for API routes', async () => {
    mockRequest = {
      nextUrl: { pathname: '/api/insight/test' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    expect(headers.get('Vary')).toBe('Accept, Accept-Encoding');
  });
  it('adds session-specific resources for session route', async () => {
    mockRequest = {
      nextUrl: { pathname: '/session' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    const link = headers.get('Link');
    expect(link).toContain('/api/insight/');
    expect(link).toContain('/api/points/');
    expect(link).toContain('/_next/static/css/app.css');
  });
  it('handles errors gracefully', async () => {
    // Mock NextResponse.next to throw an error
    mockNextResponse.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const response = await middleware(mockRequest);
    const headers = response.headers;

    // Should still have essential security headers
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');
  });

  it('prioritizes resources correctly based on weight and priority', async () => {
    mockRequest = {
      nextUrl: { pathname: '/session' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const link = response.headers.get('Link') || '';

    // High priority resources should come first
    if (!link) {
      throw new Error('No Link header found in response');
    }
    
    const linkParts = link.split(',').map((part: string) => part.trim());
    const cssIndex = linkParts.findIndex((part: string) => part.includes('app.css'));
    const audioIndex = linkParts.findIndex((part: string) => part.includes('/audio/'));
    
    // CSS (high priority) should come before audio (medium priority)
    expect(cssIndex).toBeLessThan(audioIndex);
    
    // Check weight parameter is included
    expect(link).toMatch(/weight=\d+(\.\d+)?/);
  });

  it('handles missing PUSH_MANIFEST entries gracefully', async () => {
    mockRequest = {
      nextUrl: { pathname: '/non-existent-path' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const headers = response.headers;

    // Should still have essential headers even without push resources
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Link')).toBeNull();
    expect(headers.get('Early-Hints')).toBeNull();
  });

  it('returns 500 status code on critical errors', async () => {
    mockNextResponse.mockImplementationOnce(() => {
      throw new Error('Critical error');
    });

    const response = await middleware(mockRequest);
    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
  });

  it('maintains correct ordering of resource hints', async () => {
    mockRequest = {
      nextUrl: { pathname: '/session' },
    } as unknown as NextRequest;

    const response = await middleware(mockRequest);
    const link = response.headers.get('Link') || '';
    const linkParts: string[] = link.split(',').map((part: string) => part.trim());

    // Check order: CSS (high) > API (high) > Audio (medium)
    const cssIndex = linkParts.findIndex((part: string) => part.includes('app.css'));
    const apiIndex = linkParts.findIndex((part: string) => part.includes('/api/points/'));
    const audioIndex = linkParts.findIndex((part: string) => part.includes('/audio/'));

    expect(cssIndex).toBeLessThan(apiIndex);
    expect(apiIndex).toBeLessThan(audioIndex);
  });

  it('correctly handles environment-specific headers', async () => {
    const originalEnv = process.env.APP_ENV;
    process.env.APP_ENV = 'production';
    
    const response = await middleware(mockRequest);
    const headers = response.headers;

    // Production-specific headers
    expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains; preload');
    expect(headers.has('X-Powered-By')).toBe(false);

    // Reset environment
    process.env.APP_ENV = originalEnv;
  });

  it('adds appropriate security headers for different environments', async () => {
    const environments: Array<'development' | 'staging' | 'production'> = ['development', 'staging', 'production'];
    const originalEnv = process.env.APP_ENV;

    for (const env of environments) {
      process.env.APP_ENV = env;
      const response = await middleware(mockRequest);
      const headers = response.headers;

      // Common headers across all environments
      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headers.get('X-Frame-Options')).toBe('SAMEORIGIN');

      // Environment-specific expectations
      if (env === 'production') {
        expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains; preload');
        expect(headers.has('X-Powered-By')).toBe(false);
      } else if (env === 'staging') {
        expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
        expect(headers.get('X-Powered-By')).toBe('Meridian Mastery Staging');
      }
    }

    // Reset environment
    process.env.APP_ENV = originalEnv;
  });
});
