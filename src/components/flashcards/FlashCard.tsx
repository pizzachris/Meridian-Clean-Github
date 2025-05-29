import { useState, useEffect, useRef, useCallback, memo, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { MeridianPoint3 } from '../../types/points';
import { ResourcePrefetcher } from '../../utils/resource-prefetcher';
import { cacheManager } from '../../utils/cache-manager';

// Dynamically import the flag modal
const FlagModal = dynamic(() => import('./FlagModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="text-gold-primary animate-spin">⏳</div>
    </div>
  ),
});

// Memoize sub-components
const MartialIcon = memo(({ martial }: { martial?: string }) => {
  if (!martial) return null;
  return (
    <div className="martial-icon">
      ⚔️
    </div>
  );
});
MartialIcon.displayName = 'MartialIcon';

const MeridianHeader = memo(({ meridian, pointNumber, dualMeridian, sessionItem, sessionMode }: { 
  meridian: string, 
  pointNumber?: string, 
  dualMeridian?: boolean,
  sessionItem?: string,
  sessionMode?: string
}) => (
  <div className="meridian-header">
    <div className="level-badge">
      {meridian} {pointNumber} {dualMeridian && <span>↔</span>}
    </div>
    {sessionItem && (
      <div className="text-xs opacity-80 mt-0.5">
        Training: {sessionItem} ({sessionMode})
      </div>
    )}
  </div>
));
MeridianHeader.displayName = 'MeridianHeader';

interface ExtendedMeridianPoint extends MeridianPoint3 {
  nextId?: string;
  nextAudio?: string;
  prevId?: string;
  prevAudio?: string;
}

interface FlashCardProps {
  point: ExtendedMeridianPoint;
  sessionMode?: string;
  sessionItem?: string;
  onFlip?: () => void;
  onPrefetchComplete?: () => void;
}

interface AudioState {
  context: AudioContext | null;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
}

export default memo(function FlashCard({ point, sessionMode = 'meridian', sessionItem, onFlip, onPrefetchComplete }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
  const [gptInsight, setGptInsight] = useState<string>('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [showFlagSuccess, setShowFlagSuccess] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState(false);

  const audioState = useRef<AudioState>({
    context: null,
    buffer: null,
    source: null
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const prefetchState = useRef<{
    prefetched: Set<string>;
    controller: AbortController | null;
    insightQueue: Set<string>;
  }>({
    prefetched: new Set(),
    controller: null,
    insightQueue: new Set()
  });

  // Initialize online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if point is flagged
  useEffect(() => {
    const flags = JSON.parse(localStorage.getItem('flagged-points') || '{}');
    setIsFlagged(!!flags[point.id]);
  }, [point.id]);

  // Enhanced prefetching logic
  useEffect(() => {
    if (!point.nextId || prefetchState.current.prefetched.has(point.nextId)) return;

    // Abort previous prefetch if exists
    prefetchState.current.controller?.abort();
    const controller = new AbortController();
    prefetchState.current.controller = controller;

    const prefetchNextCard = async () => {
      try {
        await ResourcePrefetcher.prefetchCard(point.nextId!, {
          priority: 'low',
          expiry: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        prefetchState.current.prefetched.add(point.nextId!);
        onPrefetchComplete?.();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.debug('Failed to prefetch next card:', error);
      }
    };

    // Start prefetching after a short delay to prioritize current card loading
    const timeoutId = setTimeout(prefetchNextCard, 1000);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [point.nextId, onPrefetchComplete]);

  // Clean up prefetch cache on unmount
  useEffect(() => {
    return () => {
      prefetchState.current.controller?.abort();
      prefetchState.current.prefetched.clear();
    };
  }, []);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioState.current.context) {
      try {
        audioState.current.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        setAudioError(true);
      }
    }
    return () => {
      // Clean up audio context on unmount
      if (audioState.current.source) {
        audioState.current.source.stop();
        audioState.current.source.disconnect();
      }
      audioState.current.context?.close();
      audioState.current = {
        context: null,
        buffer: null,
        source: null
      };
    };
  }, []);

  // Load GPT insight
  useEffect(() => {
    if (!point.id) return;

    const loadInsight = async () => {
      setLoadingInsight(true);
      try {
        const response = await fetch(`/api/insight/${point.id}`);
        if (!response.ok) throw new Error('Failed to load insight');
        const data = await response.json();
        setGptInsight(data.insight);
      } catch (error) {
        console.error('Failed to load insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    };

    loadInsight();
  }, [point.id]);

  // Enhanced audio loading with improved caching and error handling
  useEffect(() => {
    if (!point.audio || !audioState.current.context) return;

    const loadAudio = async () => {
      setAudioLoading(true);
      setAudioError(false);
      
      // Reset previous state
      if (audioState.current.source) {
        audioState.current.source.stop();
        audioState.current.source.disconnect();
        audioState.current.source = null;
      }
      audioState.current.buffer = null;
      
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      try {
        const cachedAudio = await cacheManager.get(`audio-${point.id}`);
        let arrayBuffer: ArrayBuffer;

        if (cachedAudio && isOffline) {
          arrayBuffer = cachedAudio as ArrayBuffer;
        } else {
          const response = await fetch(`/${point.audio}`, {
            signal: abortControllerRef.current.signal,
            headers: {
              'Priority': 'high',
              'Cache-Control': 'max-age=604800' // 7 days
            }
          });
          
          if (!response.ok) throw new Error('Failed to load audio');
          arrayBuffer = await response.arrayBuffer();
          
          // Cache the audio
          await cacheManager.set(`audio-${point.id}`, arrayBuffer, 7 * 24 * 60 * 60 * 1000);
        }

        // Handle suspended audio context
        if (audioState.current.context?.state === 'suspended') {
          await audioState.current.context.resume();
        }
        
        const buffer = await audioState.current.context?.decodeAudioData(arrayBuffer);
        if (buffer) {
          audioState.current.buffer = buffer;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Audio loading error:', error);
        setAudioError(true);
      } finally {
        setAudioLoading(false);
      }
    };

    loadAudio();

    return () => {
      abortControllerRef.current?.abort();
      if (audioState.current.source) {
        audioState.current.source.stop();
        audioState.current.source.disconnect();
        audioState.current.source = null;
      }
    };
  }, [point.audio, isOffline]);

  // Audio playback handler with error recovery
  const handleAudioPlay = useCallback(async () => {
    if (!audioState.current.context || !audioState.current.buffer) return;
    
    try {
      // Stop any existing playback
      if (audioState.current.source) {
        audioState.current.source.stop();
        audioState.current.source.disconnect();
      }

      // Create and configure new source
      const source = audioState.current.context.createBufferSource();
      source.buffer = audioState.current.buffer;
      source.connect(audioState.current.context.destination);
      
      // Resume context if suspended (browser autoplay policy)
      if (audioState.current.context.state === 'suspended') {
        await audioState.current.context.resume();
      }
      
      audioState.current.source = source;
      source.start(0);

      // Cleanup after playback
      source.onended = () => {
        source.disconnect();
        if (audioState.current.source === source) {
          audioState.current.source = null;
        }
      };

    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError(true);
      
      // Try to recover audio context
      try {
        if (audioState.current.context) {
          await audioState.current.context.close();
          audioState.current.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
      } catch (recoveryError) {
        console.error('Audio context recovery failed:', recoveryError);
      }
    }
  }, []);

  // Card flipping handlers
  const handleFlip = useCallback(() => {
    setFlipped(true);
    if (!hasBeenFlipped) {
      setHasBeenFlipped(true);
      onFlip?.();
    }
  }, [hasBeenFlipped, onFlip]);

  const handleFlipBack = useCallback(() => {
    setFlipped(false);
  }, []);

  // Flag submission handler with improved error handling
  const handleFlagSubmit = async (reason: string) => {
    setFlagSubmitting(true);
    try {
      const response = await fetch('/api/flag-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointId: point.id, reason }),
      });

      if (!response.ok) throw new Error('Failed to submit flag');

      setShowFlagModal(false);
      setShowFlagSuccess(true);
      setIsFlagged(true);

      // Update local storage
      const flags = JSON.parse(localStorage.getItem('flagged-points') || '{}');
      flags[point.id] = { timestamp: Date.now(), reason };
      localStorage.setItem('flagged-points', JSON.stringify(flags));

      // Hide success message after 3 seconds
      setTimeout(() => setShowFlagSuccess(false), 3000);
    } catch (error) {
      console.error('Error flagging point:', error);
      alert('Failed to submit flag. Please try again later.');
      setShowFlagModal(false);
    } finally {
      setFlagSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!flipped) handleFlip();
          else handleFlipBack();
          break;
        case 'p':
          e.preventDefault();
          if (point.audio && !audioLoading && !audioError) {
            handleAudioPlay();
          }
          break;
        case 'Escape':
          if (showFlagModal) {
            setShowFlagModal(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, point.audio, audioLoading, audioError, showFlagModal, handleFlip, handleFlipBack, handleAudioPlay]);

  const ResourceHints = memo(() => (
    <Head>
      {/* High priority current resources */}
      {point.audio && (
        <>
          <link 
            rel="preload" 
            href={`/${point.audio}`} 
            as="audio" 
            type="audio/mpeg"
            fetchPriority="high"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href={`/api/insight/${point.id}`}
            as="fetch"
            crossOrigin="anonymous"
            fetchPriority="high"
          />
        </>
      )}

      {/* Low priority next card resources */}
      {point.nextId && !prefetchState.current.prefetched.has(point.nextId) && (
        <>
          {point.nextAudio && (
            <link 
              rel="prefetch" 
              href={`/${point.nextAudio}`} 
              as="audio" 
              type="audio/mpeg"
              fetchPriority="low"
              crossOrigin="anonymous"
            />
          )}
          <link
            rel="prefetch"
            href={`/api/insight/${point.nextId}`}
            as="fetch"
            crossOrigin="anonymous"
            fetchPriority="low"
          />
        </>
      )}
    </Head>
  ));
  ResourceHints.displayName = 'ResourceHints';

  return (
    <div className="relative w-full max-w-md mx-auto select-none" style={{ perspective: 1200 }}>
      <ResourceHints />
      
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-[var(--maroon-primary)] text-[var(--gold-primary)] text-xs text-center py-1 font-serif">
          Offline Mode
        </div>
      )}

      {/* Loading Overlay */}
      {audioLoading && (
        <div className="loading-overlay">
          <div className="loading-indicator">
            <span className="animate-spin">⏳</span> Loading Audio...
          </div>
        </div>
      )}

      {/* Card Container */}
      <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="card front">
          <MartialIcon martial={point.martial} />
          <MeridianHeader 
            meridian={point.meridian} 
            pointNumber={point.pointNumber} 
            dualMeridian={point.dualMeridian} 
            sessionItem={sessionItem} 
            sessionMode={sessionMode} 
          />
          
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="korean-text">{point.korean}</h2>
            <p className="english-text">{point.english}</p>
            {point.romanized && (
              <p className="romanized-text">{point.romanized}</p>
            )}
            {point.location && (
              <p className="location-text">{point.location}</p>
            )}
            
            <div className="card-buttons">
              {point.audio && (
                <button
                  className="audio-button"
                  onClick={handleAudioPlay}
                  aria-label="Play pronunciation audio"
                  disabled={audioLoading}
                >
                  <span className="text-2xl">{audioLoading ? '⏳' : '🔊'}</span>
                </button>
              )}
              <button
                className="flip-button"
                onClick={handleFlip}
                aria-label="Flip card"
                aria-pressed={flipped}
              >
                FLIP
              </button>
            </div>
            {audioError && (
              <div className="error-text">Audio unavailable</div>
            )}
          </div>
        </div>

        {/* Back of card */}
        <div className="card back">
          <MartialIcon martial={point.martial} />
          <MeridianHeader 
            meridian={point.meridian} 
            pointNumber={point.pointNumber} 
            dualMeridian={point.dualMeridian} 
            sessionItem={sessionItem} 
            sessionMode={sessionMode} 
          />
          
          <div className="flex flex-col h-full pt-16 px-6 overflow-y-auto">
            {/* Healing Properties */}
            {point.healing && (
              <div className="back-section">
                <h3 className="section-title">HEALING PROPERTIES</h3>
                <p className="section-content">{point.healing}</p>
              </div>
            )}

            {/* Martial Effects */}
            {point.martial && (
              <div className="back-section">
                <h3 className="section-title">MARTIAL APPLICATION</h3>
                <p className="section-content">{point.martial}</p>
              </div>
            )}

            {/* GPT Insight Box */}
            <div className="back-section">
              <h3 className="section-title flex items-center gap-2">
                GPT INSIGHT
                {loadingInsight && (
                  <div className="animate-spin text-[var(--gold-primary)] text-sm">⏳</div>
                )}
              </h3>
              
              {gptInsight ? (
                <p className="section-content">{gptInsight}</p>
              ) : insightError ? (
                <p className="error-text">
                  {localStorage.getItem(`insight-error-${point.id}`) || 'Unable to load insight. Check your connection.'}
                  <button 
                    onClick={() => {
                      setInsightError(false);
                      localStorage.removeItem(`insight-error-${point.id}`);
                    }}
                    className="ml-2 text-[var(--gold-primary)] hover:underline"
                  >
                    Retry
                  </button>
                </p>
              ) : loadingInsight ? (
                <p className="text-[var(--subtext-color)] italic">
                  Generating insight...{isOffline && ' (Offline Mode)'}
                </p>
              ) : null}
            </div>

            {/* Notes if available */}
            {point.notes && (
              <div className="back-section">
                <h3 className="section-title">NOTES</h3>
                <p className="section-content">{point.notes}</p>
              </div>
            )}

            {/* Streak indicator */}
            {sessionItem && (
              <div className="text-center w-full mt-4">
                <div className="text-[var(--gold-primary)] text-sm">
                  🔥 {localStorage.getItem('streak') || '0'} Day Streak
                </div>
              </div>
            )}

            {/* Back button and Flag button */}
            <div className="flex flex-col gap-2 w-full mt-6">
              <button
                className="flip-button w-full"
                onClick={handleFlipBack}
                aria-label="Flip back"
              >
                BACK
              </button>
              <button                
                className={`text-[var(--subtext-color)] text-sm hover:text-[var(--gold-primary)] transition-all duration-300 flex items-center justify-center gap-1 ${isFlagged ? 'text-[var(--gold-primary)] scale-105' : ''}`}
                onClick={() => setShowFlagModal(true)}
                aria-label={isFlagged ? 'View reported information' : 'Report incorrect information'}
                aria-expanded={showFlagModal}
                aria-haspopup="dialog"
              >
                <span className="transform transition-transform duration-300">
                  {isFlagged ? '🚩' : '⚠️'}
                </span>
                {isFlagged ? 'Point Reported' : 'Report incorrect information'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Modal */}
      <Suspense fallback={null}>
        {showFlagModal && (
          <FlagModal 
            isOpen={showFlagModal}
            onClose={() => setShowFlagModal(false)}
            onSubmit={handleFlagSubmit}
            onChange={(value: string) => setFlagReason(value)}
            flagReason={flagReason}
            isSubmitting={flagSubmitting}
          />
        )}
      </Suspense>

      {/* Success Notification */}
      {showFlagSuccess && (
        <div 
          className="fixed bottom-4 right-4 bg-[var(--gold-primary)] text-black px-6 py-4 rounded-xl shadow-lg z-50 max-w-xs transform transition-all duration-300 animate-fade-in hover:scale-105"
          role="alert"
          aria-live="polite"
        >
          <p className="font-serif font-bold text-center">
            Thank you for your feedback! The information has been reported.
          </p>
        </div>
      )}
    </div>
  );
});