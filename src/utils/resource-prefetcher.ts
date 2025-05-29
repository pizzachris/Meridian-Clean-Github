import { cacheManager } from './cache-manager';

interface PrefetchOptions {
  priority?: 'high' | 'low';
  expiry?: number;
}

export class ResourcePrefetcher {
  private static queue: Set<string> = new Set();
  private static controller: AbortController | null = null;

  static async prefetchCard(cardId: string, options: PrefetchOptions = {}) {
    // Skip if already queued
    if (this.queue.has(cardId)) return;
    
    // Add to queue
    this.queue.add(cardId);

    // Abort previous prefetch
    this.controller?.abort();
    this.controller = new AbortController();

    try {
      // Fetch card data
      const [insightRes, audioRes] = await Promise.all([
        fetch(`/api/insight/${cardId}`, {
          signal: this.controller.signal,
          headers: {
            'Purpose': 'prefetch',
            'Priority': options.priority || 'low',
          },
        }),
        fetch(`/audio/${cardId}.mp3`, {
          signal: this.controller.signal,
          headers: {
            'Purpose': 'prefetch',
            'Priority': options.priority || 'low',
          },
        }),
      ]);

      // Cache responses
      if (insightRes.ok) {
        const insight = await insightRes.json();
        cacheManager.set(`insight-${cardId}`, insight, options.expiry || 24 * 60 * 60 * 1000);
      }

      if (audioRes.ok) {
        const audio = await audioRes.arrayBuffer();
        cacheManager.set(`audio-${cardId}`, audio, options.expiry || 7 * 24 * 60 * 60 * 1000);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.debug('Prefetch failed:', error);
    } finally {
      this.queue.delete(cardId);
    }
  }

  static abortPrefetch() {
    this.controller?.abort();
    this.queue.clear();
  }
}
