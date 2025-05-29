import { init as initApm } from '@elastic/apm-rum';
import { Span } from '@elastic/apm-rum';

class PerformanceMonitor {
  private apm: any;
  private metrics: Map<string, number>;
  
  constructor() {
    this.metrics = new Map();
    
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APM_URL) {
      this.apm = initApm({
        serviceName: 'meridian-mastery',
        serverUrl: process.env.NEXT_PUBLIC_APM_URL,
        environment: process.env.NODE_ENV,
        
        // Performance monitoring config        pageLoadTransactionName: 'PageLoad',
        pageLoadTraceId: 'trace-id',
        pageLoadSampled: true,
        
        // Distributed tracing
        distributedTracingOrigins: [
          'https://meridian-mastery.vercel.app',
          'localhost:3000'
        ],        // Error throttling (uses default APM settings)
      });
    }
  }

  startSpan(name: string, type: string) {
    if (!this.apm) return null;
    return this.apm.startSpan(name, type);
  }

  setCustomMetric(name: string, value: number) {
    this.metrics.set(name, value);
    if (this.apm) {
      this.apm.setCustomContext({
        metrics: Object.fromEntries(this.metrics)
      });
    }
  }

  trackTiming(name: string, fn: () => Promise<any>) {
    const span = this.startSpan(name, 'custom');
    return fn().finally(() => span?.end());
  }

  trackError(error: Error, context?: object) {
    if (this.apm) {
      this.apm.captureError(error, {
        custom: context
      });
    }
  }

  measureInteraction(elementId: string) {
    if (!this.apm || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.setCustomMetric(`interaction_${elementId}`, entry.duration);
      });
    });

    observer.observe({ entryTypes: ['first-input', 'layout-shift'] });
  }

  trackResourceTiming(resource: string) {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name.includes(resource)) {
          this.setCustomMetric(`resource_${resource}`, entry.duration);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }
}

export const monitor = new PerformanceMonitor();
