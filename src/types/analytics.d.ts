// Declare global types for analytics and monitoring
declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: object) => void;
    dataLayer?: any[];
    errorTracker?: (error: Error, context?: object) => void;
    elasticApm?: {
      init: (config: {
        serviceName: string;
        serverUrl: string;
        environment: string;
      }) => void;
      addUserAction: (name: string, context?: object) => void;
      setUserContext: (context: object) => void;
      setCustomContext: (context: object) => void;
      startTransaction: (name: string, type: string, options?: object) => void;
      endTransaction: (name?: string, type?: string) => void;
      captureError: (error: Error, options?: object) => void;
    };
    Sentry?: {
      init: (options: object) => void;
      captureException: (error: Error, options?: object) => void;
      captureMessage: (message: string, options?: object) => void;
      withScope: (callback: (scope: any) => void) => void;
    };
  }
}

export {};
