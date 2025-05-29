import { monitor } from './performance';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

export class Analytics {
  private initialized = false;

  init() {
    if (this.initialized) return;
    
    // Initialize Google Analytics
    if (process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      document.head.appendChild(script);      window.dataLayer = window.dataLayer || [];
      window.gtag = function(command: string, event: string, params?: object) {
        window.dataLayer?.push([command, event, params]);
      };
      window.gtag('js', new Date().toISOString());
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: window.location.pathname,
      });
    }

    this.initialized = true;
  }

  trackEvent({ category, action, label, value, nonInteraction = false }: AnalyticsEvent) {
    if (!this.initialized) this.init();

    // Track in Google Analytics
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        non_interaction: nonInteraction
      });
    }

    // Track in performance monitoring
    monitor.setCustomMetric(`${category}_${action}`, value || 1);
  }

  trackPageView(url: string) {
    if (!this.initialized) this.init();

    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
        page_path: url,
      });
    }
  }

  trackUserEngagement(pointId: string, interaction: 'view' | 'complete' | 'review') {
    this.trackEvent({
      category: 'User Engagement',
      action: interaction,
      label: pointId,
    });
  }

  trackFeatureUsage(feature: string) {
    this.trackEvent({
      category: 'Feature Usage',
      action: 'use',
      label: feature,
    });
  }

  trackError(error: Error, context?: string) {
    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: `${context}: ${error.message}`,
      nonInteraction: true,
    });
  }

  trackTiming(category: string, variable: string, value: number) {
    if (!this.initialized) this.init();

    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        event_category: category,
        name: variable,
        value: Math.round(value),
      });
    }
  }
}

// Declare gtag for TypeScript
// Remove duplicate Window interface declaration since it's defined in analytics.d.ts

export const analytics = new Analytics();
