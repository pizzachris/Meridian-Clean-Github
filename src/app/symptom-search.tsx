

import points from '../data/points.json';
import React, { useState } from 'react';
import type { MeridianPoint3 } from '../types/points';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SymptomSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MeridianPoint3[]>([]);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults([]);
    setAiResults([]);
    const q = query.trim().toLowerCase();
    if (!q) {
      setLoading(false);
      return setResults([]);
    }
    // Local search
    setResults(
      points.filter(
        (p) =>
          p.symptoms &&
          p.symptoms.some((s: string) => s.toLowerCase().includes(q))
      )
    );
    // GPT integration (OpenAI API call)
    try {
      const res = await fetch('/api/gpt-symptom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: query })
      });
      if (!res.ok) throw new Error('AI lookup failed');
      const data = await res.json();
      setAiResults(data.points || []);
    } catch (err: any) {
      setError('AI lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background px-2">
      <h1 className="text-3xl font-bold mb-6 text-secondary">Symptom Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 w-full max-w-md">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-700 bg-card text-white focus:outline-none"
          placeholder="Enter symptom (e.g. headache)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-secondary text-black font-bold rounded-r-lg hover:bg-yellow-400 transition"
        >
          Search
        </button>
      </form>
      <div className="w-full max-w-md">
        {loading && <LoadingSpinner label="Searching..." />}
        {error && <div className="text-red-400 text-center">{error}</div>}
        {results.length === 0 && aiResults.length === 0 && query && !loading && !error && (
          <div className="text-gray-400 text-center">No points found for "{query}".</div>
        )}
        {results.length > 0 && (
          <div className="mb-4">
            <div className="text-secondary font-bold mb-2">Local Results</div>
            {results.map((point: any) => (
              <div key={point.id} className="bg-card rounded-xl shadow p-4 mb-4 border border-gray-700">
                <div className="text-secondary font-bold text-lg mb-1">{point.korean} ({point.romanized})</div>
                <div className="text-white text-base mb-1">{point.english}</div>
                <div className="text-gray-300 text-xs mb-1">{point.meridian} {point.pointNumber}</div>
                <div className="text-gray-400 text-xs">Symptoms: {point.symptoms?.join(', ')}</div>
              </div>
            ))}
          </div>
        )}
        {aiResults.length > 0 && (
          <div>
            <div className="text-secondary font-bold mb-2">AI Suggestions</div>
            {aiResults.map((point: any, idx) => (
              <div key={point.id || idx} className="bg-card rounded-xl shadow p-4 mb-4 border border-yellow-700">
                <div className="text-yellow-300 font-bold text-lg mb-1">{point.korean} ({point.romanized})</div>
                <div className="text-white text-base mb-1">{point.english}</div>
                <div className="text-gray-300 text-xs mb-1">{point.meridian} {point.pointNumber}</div>
                <div className="text-gray-400 text-xs">{point.healing}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
