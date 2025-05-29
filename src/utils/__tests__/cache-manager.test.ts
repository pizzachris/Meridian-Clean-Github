import { cacheManager } from '../../utils/cache-manager';

describe('CacheManager', () => {
  beforeEach(() => {
    // Clear any cached data
    cacheManager.clear();
  });

  it('stores and retrieves data from cache', async () => {
    const testData = { id: 1, value: 'test' };
    const key = 'test-key';
    
    await cacheManager.set(key, testData, 60 * 1000); // 1 minute expiry
    const cachedData = await cacheManager.get(key);
    
    expect(cachedData).toEqual(testData);
  });

  it('respects cache expiry', async () => {
    const testData = { id: 1, value: 'test' };
    const key = 'test-key';
    
    await cacheManager.set(key, testData, 0); // Immediate expiry
    const cachedData = await cacheManager.get(key);
    
    expect(cachedData).toBeNull();
  });

  it('prefetches and caches resources', async () => {
    const url = '/test-resource';
    const mockData = { value: 'test' };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });
    
    await cacheManager.prefetch(url);
    const cachedData = await cacheManager.get(url);
    
    expect(cachedData).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({
      headers: expect.objectContaining({ 'Purpose': 'prefetch' })
    }));
  });

  it('handles failed prefetch gracefully', async () => {
    const url = '/test-resource';
    
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await cacheManager.prefetch(url);
    const cachedData = await cacheManager.get(url);
    
    expect(cachedData).toBeNull();
  });

  it('returns null for missing cache entries', async () => {
    const cachedData = await cacheManager.get('non-existent-key');
    expect(cachedData).toBeNull();
  });
});
