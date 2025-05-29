export const CACHE_CONFIGS = {
  // Static assets like images, fonts, styles
  static: {
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    maxItems: 100,
  },
  
  // Audio files
  audio: {
    strategy: 'cache-first',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    maxItems: 50,
  },
  
  // API responses
  api: {
    strategy: 'network-first',
    maxAge: 24 * 60 * 60, // 24 hours
    maxItems: 200,
  },
  
  // GPT insights
  insights: {
    strategy: 'stale-while-revalidate',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    maxItems: 100,
  },
} as const;

export const CACHE_NAMES = {
  static: 'meridian-static-v1',
  audio: 'meridian-audio-v1',
  api: 'meridian-api-v1',
  insights: 'meridian-insights-v1',
} as const;
