'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { symptomCategories } from '../../data/symptoms';
import { meridianColors } from '../../data/meridians';
import pointsWithSymptoms from '../../utils/initializeSymptoms';
import { extractSymptomsFromHealing, findMatchingSynonyms, getCategoryForSymptom } from '../../utils/symptomMapping';

// Utility for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// TypeScript interfaces
interface Point {
  id: string;
  korean: string;
  romanized: string;
  english: string;
  meridian: string;
  pointNumber: string;
  healing: string;
  martial: string;
  symptoms: string[];
}

interface Category {
  id: string;
  name: string;
  symptoms: string[];
}

interface SearchResult extends Point {
  score: number;
  matchedSymptoms: string[];
  matchedHealing: boolean;
}

interface FuseResult {
  item: Point;
  score: number;
}

// Cache keys
const SEARCH_CACHE_KEY = 'symptom-search-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function SymptomSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMeridian, setSelectedMeridian] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse<Point>(pointsWithSymptoms as Point[], {
      keys: ['symptoms', 'healing', 'korean', 'romanized', 'english'],
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
      useExtendedSearch: true
    });
  }, []);

  // Load cached results and recent searches
  useEffect(() => {
    const loadCachedResults = () => {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY);
      if (cached) {
        try {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setResults(data);
          } else {
            localStorage.removeItem(SEARCH_CACHE_KEY);
          }
        } catch (error) {
          localStorage.removeItem(SEARCH_CACHE_KEY);
        }
      }
    };

    const loadRecentSearches = () => {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent searches:', e);
        }
      }
    };

    loadCachedResults();
    loadRecentSearches();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!results.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handlePointSelect(results[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results.length, selectedIndex]);

  // Auto-search as user types with debounce
  const debouncedSearch = useMemo(
    () => debounce((q: string) => handleSearch(undefined, q), 300),
    []
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  const handleSearch = async (e?: React.FormEvent, searchQuery: string = query) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Find synonym matches
      const synonymMatches = findMatchingSynonyms(searchQuery);
      const searchTerms = [searchQuery, ...synonymMatches];

      // Perform fuzzy search
      let searchResults: SearchResult[] = [];
      
      (pointsWithSymptoms as Point[]).forEach((point: Point) => {
        // Skip if meridian filter is active and doesn't match
        if (selectedMeridian && point.meridian !== selectedMeridian) {
          return;
        }

        let score = 0;
        const matchedSymptoms: string[] = [];
        let matchedHealing = false;

        // Extract symptoms from healing properties
        const allSymptoms = [
          ...(point.symptoms || []),
          ...extractSymptomsFromHealing(point.healing)
        ];

        // Check for matches in symptoms and healing
        searchTerms.forEach(term => {
          // Check symptoms
          allSymptoms.forEach(symptom => {
            if (symptom.toLowerCase().includes(term.toLowerCase())) {
              score += 1;
              if (!matchedSymptoms.includes(symptom)) {
                matchedSymptoms.push(symptom);
              }
            }
          });

          // Check healing properties
          if (point.healing.toLowerCase().includes(term.toLowerCase())) {
            score += 0.5;
            matchedHealing = true;
          }

          // Check Korean/Romanized/English names
          if (point.korean.toLowerCase().includes(term.toLowerCase()) ||
              point.romanized.toLowerCase().includes(term.toLowerCase()) ||
              point.english.toLowerCase().includes(term.toLowerCase())) {
            score += 0.5;
          }
        });

        // Add fuzzy search score
        const fuseResults = fuse.search(searchQuery);        const fuseResult = fuseResults.find(r => r.item.id === point.id);
        if (fuseResult && typeof fuseResult.score === 'number') {
          score = score / (fuseResult.score + 1);
        } else {
          score = score * 0.8; // Slightly penalize non-fuzzy matches
        }

        // Filter by category if selected
        if (selectedCategory) {
          const category = symptomCategories.find(c => c.id === selectedCategory);
          if (category) {
            const hasMatchingCategorySymptom = matchedSymptoms.some(
              symptom => getCategoryForSymptom(symptom) === selectedCategory
            );
            if (!hasMatchingCategorySymptom) {
              return;
            }
          }
        }

        if (score > 0) {
          searchResults.push({
            ...point,
            score,
            matchedSymptoms,
            matchedHealing
          });
        }
      });

      // Sort results by score
      searchResults.sort((a, b) => b.score - a.score);

      // Cache results
      localStorage.setItem(
        SEARCH_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: searchResults
        })
      );

      // Update recent searches
      if (searchQuery.trim()) {
        const newRecentSearches = [
          searchQuery,
          ...recentSearches.filter(s => s !== searchQuery)
        ].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));
      }

      setResults(searchResults);
    } catch (err) {
      setError('Failed to process search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    if (query) handleSearch(undefined, query);
  };

  const handleMeridianSelect = (meridianCode: string | null) => {
    setSelectedMeridian(meridianCode === selectedMeridian ? null : meridianCode);
    if (query) handleSearch(undefined, query);
  };

  const handlePointSelect = (pointId: string) => {
    router.push(`/points/${pointId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--bg-gradient-from)] to-[var(--bg-gradient-to)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-center mb-8">
          <span className="block text-[var(--gold-primary)] font-serif text-lg">SYMPTOM</span>
          <span className="block text-3xl font-bold font-serif tracking-wide">LOOKUP</span>
        </h1>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="mb-6">
            <h2 className="text-[var(--gold-primary)] font-serif text-sm mb-2">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="px-3 py-1 bg-[var(--maroon-primary)] text-[var(--gold-primary)] rounded-full text-sm hover:bg-[var(--maroon-hover)] transition-all"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {symptomCategories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[var(--gold-primary)] text-black font-bold shadow-lg'
                    : 'bg-[var(--maroon-primary)] text-[var(--gold-primary)] border border-[var(--gold-primary)]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Meridian Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(meridianColors).map(([code, info]) => (
              <button
                key={code}
                onClick={() => handleMeridianSelect(code)}
                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                  selectedMeridian === code
                    ? 'bg-[var(--gold-primary)] text-black font-bold shadow-lg'
                    : 'bg-[var(--maroon-primary)] text-[var(--gold-primary)] border border-[var(--gold-primary)]'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                {info.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-4 py-2.5 rounded-l-xl bg-[var(--maroon-primary)] border-2 border-[var(--gold-primary)] text-white focus:outline-none focus:border-[var(--gold-hover)] transition placeholder:text-[var(--subtext-color)]"
              placeholder="Enter symptom (e.g. headache, pain, digestive)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setQuery('');
                  setResults([]);
                  searchInputRef.current?.blur();
                }
              }}
              aria-label="Search for symptoms"
              aria-expanded={results.length > 0}
              role="combobox"
              aria-controls="search-results"
              aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
            />
            {query && query.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--maroon-primary)] border-2 border-[var(--gold-primary)] rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                {findMatchingSynonyms(query).map((synonym, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left text-[var(--subtext-color)] hover:bg-[var(--gold-primary)] hover:text-black transition"
                    onClick={() => setQuery(synonym)}
                    type="button"
                  >
                    {synonym}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[var(--gold-primary)] text-black font-bold rounded-r-xl hover:bg-[var(--gold-hover)] transition disabled:opacity-50 shadow-lg font-serif tracking-wide"
            disabled={isLoading || !query.trim()}
            aria-label={isLoading ? 'Searching...' : 'Search'}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Searching...
              </span>
            ) : (
              'SEARCH'
            )}
          </button>
        </form>

        {/* View Toggle */}
        <div className="mb-4 flex justify-end">
          <div className="inline-flex rounded-lg border-2 border-[var(--gold-primary)] overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-1 text-sm ${
                view === 'list'
                  ? 'bg-[var(--gold-primary)] text-black font-bold'
                  : 'text-[var(--gold-primary)]'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-1 text-sm ${
                view === 'grid'
                  ? 'bg-[var(--gold-primary)] text-black font-bold'
                  : 'text-[var(--gold-primary)]'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-[var(--maroon-primary)] border-2 border-[var(--gold-primary)] rounded-xl text-[var(--gold-primary)] text-center font-serif" role="alert">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 underline hover:no-underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results */}
        <div 
          className={`space-y-4 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`} 
          id="search-results" 
          role="listbox"
        >
          {/* Empty State */}
          {results.length === 0 && query && !isLoading && !error && (
            <div className="text-[var(--subtext-color)] text-center font-serif">
              No points found for "{query}".
            </div>
          )}

          {/* Results List/Grid */}
          {results.map((point: SearchResult, index: number) => (
            <div
              key={point.id}
              onClick={() => handlePointSelect(point.id)}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseLeave={() => setSelectedIndex(-1)}
              className={`bg-[var(--maroon-primary)] rounded-xl p-5 cursor-pointer border-2 ${
                selectedIndex === index 
                  ? 'border-[var(--gold-highlight)] scale-[1.02] shadow-xl' 
                  : 'border-[var(--gold-primary)] hover:scale-[1.02]'
              } transition-all duration-300 shadow-lg focus-within:ring-2 focus-within:ring-[var(--gold-primary)]`}
              role="option"
              id={`result-${index}`}
              aria-selected={selectedIndex === index}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[var(--gold-primary)] font-bold text-xl font-serif mb-1">
                    {point.korean}
                  </div>
                  <div className="text-white text-lg font-serif">{point.english}</div>
                  <div className="text-[var(--gold-primary)] font-serif font-bold">
                    {point.meridian} {point.pointNumber}
                  </div>
                </div>
              </div>
              
              <div className="text-[var(--subtext-color)] text-sm mb-3">
                {point.romanized}
              </div>
              
              <div className="text-white text-sm mb-3">
                {point.healing}
              </div>
              
              {point.matchedSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {point.matchedSymptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-[var(--gold-primary)] bg-opacity-20 text-[var(--gold-primary)] text-xs px-3 py-1 rounded-full font-serif"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
