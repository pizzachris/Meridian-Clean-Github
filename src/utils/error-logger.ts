import * as Sentry from '@sentry/nextjs';

interface ErrorLoggerOptions {
  context?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    type?: 'anonymous' | 'registered';
  };
  tags?: Record<string, string>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  fingerprint?: string[];
  extra?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private initialized = false;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  init() {
    if (this.initialized) return;

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
        environment: process.env.APP_ENV || process.env.NODE_ENV,
        beforeSend(event) {
          // Filter out non-error events in production
          if (process.env.NODE_ENV === 'production' && !event.exception) {
            return null;
          }
          return event;
        },
        integrations: [
          // Initialize browser tracing only in client-side code
          typeof window !== 'undefined'
            ? new (require('@sentry/browser').BrowserTracing)({
                tracePropagationTargets: ['localhost', 'meridianmastery.com'],
              })
            : null,
        ].filter(Boolean),
      });
    }

    this.initialized = true;
  }

  captureException(error: Error, options: ErrorLoggerOptions = {}) {
    if (!this.initialized) this.init();

    const { context, user, tags, level = 'error' } = options;

    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
      console.error('Context:', context);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('error_context', context);
      }

      if (user) {
        scope.setUser(user);
      }

      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      scope.setLevel(level);

      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, options: ErrorLoggerOptions = {}) {
    if (!this.initialized) this.init();

    const { context, user, tags, level = 'info' } = options;

    if (process.env.NODE_ENV === 'development') {
      console.log('Message:', message);
      console.log('Context:', context);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        scope.setContext('message_context', context);
      }

      if (user) {
        scope.setUser(user);
      }

      if (tags) {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      scope.setLevel(level);

      Sentry.captureMessage(message);
    });
  }
}

export const errorLogger = ErrorLogger.getInstance();
