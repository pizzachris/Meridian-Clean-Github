import { MeridianPoint3 } from '../types/points';

interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeFields?: (keyof MeridianPoint3)[];
  filters?: Partial<MeridianPoint3>;
}

export async function exportData(points: MeridianPoint3[], options: ExportOptions): Promise<Blob> {
  const filteredPoints = filterPoints(points, options.filters);
  const processedPoints = processFields(filteredPoints, options.includeFields);

  switch (options.format) {
    case 'json':
      return exportJson(processedPoints);
    case 'csv':
      return exportCsv(processedPoints);
    case 'xlsx':
      return await exportXlsx(processedPoints);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function filterPoints(points: MeridianPoint3[], filters?: Partial<MeridianPoint3>): MeridianPoint3[] {
  if (!filters) return points;

  return points.filter(point => {
    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return (point[key as keyof MeridianPoint3] as any[])?.some(v => value.includes(v));
      }
      return point[key as keyof MeridianPoint3] === value;
    });
  });
}

function processFields(points: MeridianPoint3[], fields?: (keyof MeridianPoint3)[]): Partial<MeridianPoint3>[] {
  if (!fields) return points;
  return points.map(point => {
    const processedPoint: Record<keyof MeridianPoint3, any> = {} as Record<keyof MeridianPoint3, any>;
    fields.forEach(field => {
      processedPoint[field] = point[field];
    });
    return processedPoint;
  });
}

function exportJson(data: any[]): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

function exportCsv(data: any[]): Blob {
  if (data.length === 0) {
    return new Blob([''], { type: 'text/csv' });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return `"${value.join(';')}"`;
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    )
  ];

  return new Blob([csvRows.join('\n')], { type: 'text/csv' });
}

async function exportXlsx(data: any[]): Promise<Blob> {
  try {
    // Dynamically import xlsx to reduce initial bundle size
    const XLSX = await import('xlsx');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Points');

    // Generate xlsx file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error('Failed to generate Excel file. Please try a different format.');
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
