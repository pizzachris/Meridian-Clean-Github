import compression from 'compression';
import { Request, Response } from 'express';
import { constants as zlibConstants } from 'zlib';

// Skip compression for these types
const SKIP_COMPRESSION = [
  'image/',
  'video/',
  'audio/',
  '.pdf',
  '.zip',
];

function shouldCompress(req: Request, res: Response): boolean {
  if (req.headers['x-no-compression']) return false;
  
  const contentType = res.getHeader('Content-Type') as string;
  if (!contentType) return true;
  
  return !SKIP_COMPRESSION.some(type => contentType.includes(type));
}

const compressionMiddleware = compression({
  filter: shouldCompress,
  level: 6, // Balance between compression ratio and CPU usage
  threshold: 1024, // Only compress responses > 1KB
  
  // Custom Brotli options when available
  ...(process.env.NODE_ENV === 'production' && {
    brotliOptions: {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 5
      }
    }
  })
});

export default compressionMiddleware;
