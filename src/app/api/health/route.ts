import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check IndexedDB availability (critical for PWA)
    const indexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
    
    // Check service worker registration
    const swRegistered = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    
    // Check local storage (needed for progress tracking)
    const localStorageAvailable = typeof window !== 'undefined' && 'localStorage' in window;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        indexedDB: indexedDBAvailable,
        serviceWorker: swRegistered,
        localStorage: localStorageAvailable,
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({
      status: 'unhealthy',
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}
