export interface CacheConfig {
  maxAge: number;  // Cache duration in milliseconds
  maxSize: number; // Maximum number of items to cache
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

export class ValidationCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.cache = new Map();
    this.config = config;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      hits: 0
    });
    this.cleanup();
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // Update hit count and return data
    entry.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    if (this.cache.size <= this.config.maxSize) return;

    // Convert to array for sorting
    const entries = Array.from(this.cache.entries());

    // Sort by hits (ascending) and then by timestamp (oldest first)
    entries.sort(([, a], [, b]) => {
      if (a.hits === b.hits) {
        return a.timestamp - b.timestamp;
      }
      return a.hits - b.hits;
    });

    // Remove oldest/least used entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - this.config.maxSize);
    entriesToRemove.forEach(([key]) => this.cache.delete(key));
  }
}
