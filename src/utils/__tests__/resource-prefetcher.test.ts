import { ResourcePrefetcher } from '../../utils/resource-prefetcher';

describe('ResourcePrefetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        type: 'basic' as ResponseType,
        url: 'https://test.com',
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ insight: 'Test insight' }),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        text: () => Promise.resolve(''),
        clone: function() { return this as Response }
      } as Response)
    );
  });

  it('prefetches card resources', async () => {
    await ResourcePrefetcher.prefetchCard('test-1', { priority: 'low' });
    
    expect(global.fetch).toHaveBeenCalledTimes(2); // One for insight, one for audio
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/insight/test-1'), expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/audio/test-1'), expect.any(Object));
  });

  it('aborts previous prefetch when new one starts', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    
    await ResourcePrefetcher.prefetchCard('test-1');
    await ResourcePrefetcher.prefetchCard('test-2');
    
    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  it('caches prefetched resources', async () => {
    await ResourcePrefetcher.prefetchCard('test-1');
    
    // Try prefetching the same card again
    await ResourcePrefetcher.prefetchCard('test-1');
    
    // Should only fetch once as the second request should use cached data
    expect(global.fetch).toHaveBeenCalledTimes(2); // Initial insight and audio fetch
  });
});
