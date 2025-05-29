import { useEffect } from 'react';
import { analytics } from '../utils/analytics';
import { monitor } from '../utils/performance';

export function useProgressTracking(current: number, total: number, category: string) {
  useEffect(() => {
    if (current > 0) {
      const progressValue = Math.round((current / total) * 100);
      
      // Track progress milestones
      if (progressValue % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        analytics.trackEvent({
          category,
          action: 'milestone',
          label: `${progressValue}% Complete`,
          value: progressValue
        });
      }

      // Track in performance monitoring
      monitor.setCustomMetric(`${category}_completed`, current);
      monitor.setCustomMetric(`${category}_percentage`, progressValue);
    }
  }, [current, total, category]);
}
