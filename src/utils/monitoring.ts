import { init as initApm, ApmBase } from '@elastic/apm-rum';
import { init as initSentry } from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import type { Metric as WebVitalMetric } from 'web-vitals';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

interface Metric {
  name: 'CLS' | 'LCP' | 'TTFB' | 'FCP';
  value: number;
  id: string;
  navigationType?: string;
}

interface PerformanceDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface ApmErrorOptions {
  labels: Record<string, string>;
  custom?: Record<string, any>;
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private metricsHistory: Map<string, PerformanceDataPoint[]>;
  private readonly MAX_HISTORY_LENGTH = 100;
  private observers: Set<() => void>;

  private constructor() {
    this.metricsHistory = new Map();
    this.observers = new Set();
    this.initWebVitals();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }
  private initWebVitals(): void {
    onCLS(this.handleCLS.bind(this));
    onLCP(this.handleLCP.bind(this));
    onTTFB(this.handleTTFB.bind(this));
    onFCP(this.handleFCP.bind(this));
  }
  private handleWebVital(metric: Metric) {
    switch (metric.name) {
      case 'CLS':
        this.handleCLS(metric);
        break;
      case 'LCP':
        this.handleLCP(metric);
        break;
      case 'TTFB':
        this.handleTTFB(metric);
        break;
      case 'FCP':
        this.handleFCP(metric);
        break;
      default:
        this.trackMetric(metric.name, metric.value);
    }
  }

  private handleCLS(metric: Metric): void {
    this.trackMetric('CLS', metric.value);
  }

  private handleLCP(metric: Metric): void {
    this.trackMetric('LCP', metric.value);
  }

  private handleTTFB(metric: Metric): void {
    this.trackMetric('TTFB', metric.value);
  }

  private handleFCP(metric: Metric): void {
    this.trackMetric('FCP', metric.value);
  }

  private trackMetric(name: string, value: number, label?: string): void {
    const dataPoint: PerformanceDataPoint = {
      timestamp: Date.now(),
      value,
      label
    };

    const history = this.metricsHistory.get(name) || [];
    history.push(dataPoint);

    if (history.length > this.MAX_HISTORY_LENGTH) {
      history.shift();
    }

    this.metricsHistory.set(name, history);
    this.notifyObservers();

    if (window.gtag) {
      window.gtag('event', name, {
        event_category: 'Performance',
        event_label: label,
        value: Math.round(value),
        non_interaction: true
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric - ${name}: ${value}${label ? ` (${label})` : ''}`);
    }
  }

  startMeasurement(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasurement(name: string): void {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const entries = performance.getEntriesByName(name);
        const lastEntry = entries[entries.length - 1];
        
        this.trackMetric(name, lastEntry.duration);

        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
      } catch (error) {
        console.error(`Error measuring performance for ${name}:`, error);
      }
    }
  }

  getMetrics(name?: string): Map<string, PerformanceDataPoint[]> | PerformanceDataPoint[] | undefined {
    if (name) {
      return this.metricsHistory.get(name);
    }
    return this.metricsHistory;
  }

  analyzeResourceTiming(): void {
    if (typeof performance === 'undefined') return;

    const resources = performance.getEntriesByType('resource');
    const summary = new Map<string, { count: number; totalDuration: number }>();

    resources.forEach(resource => {
      const type = resource.initiatorType;
      const current = summary.get(type) || { count: 0, totalDuration: 0 };

      summary.set(type, {
        count: current.count + 1,
        totalDuration: current.totalDuration + resource.duration
      });

      this.trackMetric(
        `Resource-${type}`,
        resource.duration,
        resource.name.split('/').pop()
      );
    });

    if (process.env.NODE_ENV === 'development') {
      console.group('Resource Timing Analysis');
      summary.forEach(({ count, totalDuration }, type) => {
        console.log(`${type}: ${count} resources, avg ${(totalDuration / count).toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }

  subscribe(observer: () => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer());
  }

  clearHistory(name?: string): void {
    if (name) {
      this.metricsHistory.delete(name);
    } else {
      this.metricsHistory.clear();
    }
    this.notifyObservers();
  }
}

export const performanceManager = PerformanceManager.getInstance();

export const initMonitoring = () => {
  // Initialize error tracking with Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    initSentry({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      integrations: []
    });
  }

  // Initialize performance monitoring with Elastic APM
  if (process.env.NEXT_PUBLIC_APM_URL) {
    const apm = initApm({
      serviceName: 'meridian-mastery',
      serverUrl: process.env.NEXT_PUBLIC_APM_URL,
      environment: process.env.NODE_ENV,
      distributedTracingOrigins: process.env.NEXT_PUBLIC_DOMAIN ? [
        'localhost',
        process.env.NEXT_PUBLIC_DOMAIN
      ].filter(Boolean) : []
    });

    // Monitor page loads and route changes
    window.addEventListener('load', () => {
      apm.setInitialPageLoadName(window.location.pathname);
      performanceManager.analyzeResourceTiming();
    });

    // Set up APM methods
    window.elasticApm = {
      init(config: { serviceName: string; serverUrl: string; environment: string }) {
        apm.init(config);
      },
      startTransaction(name: string, type: string, options?: object) {
        return apm.startTransaction(name, type, options);
      },
      endTransaction(name?: string, type?: string) {
        const currentTransaction = apm.getCurrentTransaction();
        if (currentTransaction) {
          currentTransaction.end();
        }
      },
      addUserAction(name: string, context?: object) {
        apm.startTransaction(name, 'user-action', {
          ...(context || {}),
          startTime: Date.now()
        });
      },
      setUserContext(context: object) {
        apm.setUserContext(context);
      },
      setCustomContext(context: object) {
        apm.setCustomContext(context);
      },
      captureError(error: Error) {
        apm.captureError(error);
      }
    };
  }
};

// Report web vitals metrics (legacy)
export const reportWebVitals = (metric: WebVitalMetric) => {
  const instance = PerformanceManager.getInstance();
  (instance as any).trackMetric(metric.name, metric.value);
};

// Error tracking with enhanced context
export const trackError = (error: Error, context?: object) => {
  // Send to all error tracking services
  if (window.errorTracker) {
    window.errorTracker(error, context);
  }

  if ((window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context);
  }
};

// Enhanced analytics tracking
export const trackEvent = (eventName: string, properties?: object) => {
  // Send to analytics services
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Send to APM if available
  if (window.elasticApm) {
    window.elasticApm.addUserAction(eventName, properties);
  }
};

// Feature usage tracking with timing
export const trackFeatureUsage = (featureName: string, data?: object) => {
  const measurementName = `feature_${featureName}`;
  performanceManager.startMeasurement(measurementName);

  return {
    end: () => {
      performanceManager.endMeasurement(measurementName);
      trackEvent('feature_used', {
        feature: featureName,
        ...data
      });
    }
  };
};

// Extended window object type for TypeScript
// Remove duplicate Window interface declaration since it's defined in analytics.d.ts
