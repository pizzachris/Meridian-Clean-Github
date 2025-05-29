/**
 * Cache manager for the Meridian Mastery app
 * Handles local caching strategies and prefetching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  size?: number;
}

interface CacheConfig {
  maxItems: number;
  maxSize: number; // in bytes
  cleanupRatio: number; // clean up when cache reaches this ratio of maxSize
}

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private totalSize: number = 0;
  private config: CacheConfig = {
    maxItems: 200,
    maxSize: 50 * 1024 * 1024, // 50MB
    cleanupRatio: 0.8
  };
  private constructor() {
    // Clean up periodically and when tab becomes visible
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.cleanup();
        }
      });

      // Clean up when memory is under pressure
      if ('onmemorywarning' in window) {
        window.addEventListener('memorywarning', () => this.cleanup());
      }
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      // Check expiry
      if (Date.now() > entry.timestamp + entry.expiry) {
        this.cache.delete(key);
        if (entry.size) {
          this.totalSize -= entry.size;
        }
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  set(key: string, data: any, expiry: number): void {
    try {
      // Estimate size of data
      const size = this.estimateSize(data);
      
      // Check if we need to clean up
      if (this.totalSize + size > this.config.maxSize * this.config.cleanupRatio) {
        this.cleanup();
      }

      // If still too big after cleanup, remove oldest entries
      if (this.totalSize + size > this.config.maxSize) {
        this.removeOldest(size);
      }

      const entry: CacheEntry<any> = {
        data,
        timestamp: Date.now(),
        expiry,
        size
      };

      // Remove existing entry if it exists
      if (this.cache.has(key)) {
        const oldEntry = this.cache.get(key)!;
        if (oldEntry.size) {
          this.totalSize -= oldEntry.size;
        }
      }

      this.cache.set(key, entry);
      this.totalSize += size;

    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async prefetch(url: string, options: RequestInit = {}): Promise<void> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Purpose': 'prefetch',
        },
        signal: options.signal || (new AbortController()).signal
      });
      
      if (!response.ok) throw new Error('Prefetch failed');
      
      const data = await response.json();
      this.set(url, data, 24 * 60 * 60 * 1000); // 24 hours
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.debug('Prefetch failed:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.expiry) {
        this.cache.delete(key);
        if (entry.size) {
          this.totalSize -= entry.size;
        }
      }
    }
  }

  private removeOldest(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSize = 0;
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      if (entry.size) {
        this.totalSize -= entry.size;
        freedSize += entry.size;
      }
      if (freedSize >= requiredSize) break;
    }
  }

  private estimateSize(data: any): number {
    try {
      if (data instanceof ArrayBuffer) {
        return data.byteLength;
      }
      if (data instanceof Blob) {
        return data.size;
      }
      // For objects/arrays, estimate using JSON
      return new TextEncoder().encode(JSON.stringify(data)).length;
    } catch (error) {
      console.warn('Failed to estimate cache entry size:', error);
      return 0;
    }
  }
}

export const cacheManager = CacheManager.getInstance();
