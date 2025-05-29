'use client';

import { useState, useEffect } from 'react';
import { verifyAllPoints, type VerificationResult, type VerificationStats } from '@/utils/pointVerification';
import points from '@/data/points.json';

const regionColors = {
  head: 'bg-blue-100',
  arms: 'bg-green-100',
  trunk: 'bg-yellow-100',
  legs: 'bg-orange-100',
  feet: 'bg-red-100',
  unassigned: 'bg-gray-100'
};

export default function PointVerification() {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'complete', 'incomplete'
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const { results, stats } = verifyAllPoints(points);
    setResults(results);
    setStats(stats);
  }, []);

  const filteredResults = results.filter(result => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'complete' && result.status === 'complete') ||
      (filter === 'incomplete' && result.status === 'incomplete');

    const matchesRegion = 
      selectedRegion === 'all' || 
      result.regions.includes(selectedRegion);

    const matchesSearch = 
      searchTerm === '' || 
      result.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesRegion && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Point Data Verification</h1>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Points</h3>
            <p className="text-2xl">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Complete</h3>
            <p className="text-2xl text-green-600">
              {stats.complete} ({((stats.complete / stats.total) * 100).toFixed(1)}%)
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Incomplete</h3>
            <p className="text-2xl text-red-600">
              {stats.total - stats.complete} ({(((stats.total - stats.complete) / stats.total) * 100).toFixed(1)}%)
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Bilateral Points</h3>
            <p className="text-2xl">{stats.bilateral}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          className="border rounded px-3 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Points</option>
          <option value="complete">Complete Only</option>
          <option value="incomplete">Incomplete Only</option>
        </select>

        <select 
          className="border rounded px-3 py-2"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="all">All Regions</option>
          <option value="head">Head</option>
          <option value="arms">Arms</option>
          <option value="trunk">Trunk</option>
          <option value="legs">Legs</option>
          <option value="feet">Feet</option>
        </select>

        <input
          type="text"
          placeholder="Search by point ID..."
          className="border rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Point ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Regions</th>
              <th className="px-4 py-2 text-left">Issues</th>
              <th className="px-4 py-2 text-center">Measurements</th>
              <th className="px-4 py-2 text-center">Landmarks</th>
              <th className="px-4 py-2 text-center">View</th>
              <th className="px-4 py-2 text-center">Bilateral</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result) => (
              <tr key={result.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{result.id}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    result.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {result.regions.map(region => (
                      <span 
                        key={region}
                        className={`${regionColors[region as keyof typeof regionColors]} px-2 py-1 rounded-full text-xs`}
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <ul className="list-disc list-inside">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="text-red-600 text-sm">{issue}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 text-center">
                  {result.hasMeasurements ? '✅' : '❌'}
                </td>
                <td className="px-4 py-2 text-center">
                  {result.hasLandmarks ? '✅' : '❌'}
                </td>
                <td className="px-4 py-2 text-center">
                  {result.hasView ? '✅' : '❌'}
                </td>
                <td className="px-4 py-2 text-center">
                  {result.isBilateral ? '✅' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Region Stats */}
      {stats && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Region Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byRegion).map(([region, count]) => (
              <div 
                key={region}
                className={`${regionColors[region as keyof typeof regionColors]} p-4 rounded-lg`}
              >
                <h3 className="font-semibold capitalize">{region}</h3>
                <p className="text-xl">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Stats */}
      {stats && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">View Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byView).map(([view, count]) => (
              <div 
                key={view}
                className="bg-white p-4 rounded-lg shadow"
              >
                <h3 className="font-semibold capitalize">{view}</h3>
                <p className="text-xl">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
