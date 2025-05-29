import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { errorLogger } from '../utils/error-logger';

interface CustomRequest extends Request {
  // ip is already included in Express Request type
}

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = process.env.NODE_ENV === 'production' ? 100 : 1000;

const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: MAX_REQUESTS,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },  handler: (req: CustomRequest, res: Response) => {
    const userAgent = req.headers['user-agent'] as string | undefined;    errorLogger.captureMessage('Rate limit exceeded', {
      context: {
        ip: req.ip || 'unknown',
        path: req.url,
        userAgent,
      },
      level: 'warning',
      tags: { type: 'rate_limit' }
    });

    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
    });
  },  skip: (req: CustomRequest) => {
    // Skip rate limiting for health checks
    const healthCheck = req.headers['x-health-check'] as string | undefined;
    return healthCheck === '1';
  },
  keyGenerator: (req: CustomRequest) => {
    // Use combination of IP and User-Agent to prevent shared IP issues
    const userAgent = req.headers['user-agent'] as string | undefined;
    return `${req.ip || 'unknown'}-${userAgent || 'unknown'}`;
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

export default rateLimiter;
