import React, { useState } from 'react';
import { MeridianPoint3 } from '@/types/points';
import { exportData, downloadBlob } from '@/utils/data-export';

interface ExportModalProps {
  points: MeridianPoint3[];
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ points, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'xlsx'>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<Set<keyof MeridianPoint3>>(new Set([
    'id',
    'korean',
    'romanized',
    'english',
    'meridian',
    'pointNumber',
    'location'
  ]));

  const [filters, setFilters] = useState({
    meridian: '',
    region: '',
    status: 'all'
  });

  const handleFieldToggle = (field: keyof MeridianPoint3) => {
    const newFields = new Set(selectedFields);
    if (newFields.has(field)) {
      newFields.delete(field);
    } else {
      newFields.add(field);
    }
    setSelectedFields(newFields);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Apply filters
      const exportFilters: Partial<MeridianPoint3> = {};
      if (filters.meridian) exportFilters.meridian = filters.meridian;
      if (filters.region) exportFilters.region = filters.region;

      const blob = await exportData(points, {
        format,
        includeFields: Array.from(selectedFields),
        filters: Object.keys(exportFilters).length > 0 ? exportFilters : undefined
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `meridian-points-${timestamp}.${format}`;

      downloadBlob(blob, filename);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
          <h2 className="text-2xl font-semibold mb-4">Export Points Data</h2>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="flex gap-4">
              {(['json', 'csv', 'xlsx'] as const).map(f => (
                <label key={f} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={e => setFormat(e.target.value as typeof format)}
                    className="mr-2"
                  />
                  {f.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Fields Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Fields to Include</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">              {(Object.keys(points[0] || {}) as Array<keyof MeridianPoint3>).map(field => (
                <label key={String(field)} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="mr-2"
                  />
                  <span>{String(field)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Filters</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.meridian}
                onChange={e => setFilters(f => ({ ...f, meridian: e.target.value }))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Meridians</option>
                {Array.from(new Set(points.map(p => p.meridian))).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={filters.region}
                onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {['head', 'arms', 'trunk', 'legs', 'feet'].map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || selectedFields.size === 0}
              className={`px-4 py-2 rounded bg-blue-600 text-white ${
                loading || selectedFields.size === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
