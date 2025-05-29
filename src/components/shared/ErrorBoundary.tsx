import React from 'react';
import { captureException, type User } from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
  fallback?: React.ReactNode;
  user?: User;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Enhanced error handling with more context
    const errorContext = {
      componentStack: errorInfo.componentStack,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      errorType: error.name,
      isNetworkError: this.isNetworkError(),
      isOffline: typeof window !== 'undefined' ? !window.navigator.onLine : undefined,
      viewportSize: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : undefined
    };

    // Log to Sentry with enhanced context
    captureException(error, {
      extra: errorContext,
      tags: {
        componentName: this.constructor.name,
        environment: process.env.NODE_ENV,
        errorCategory: this.isNetworkError() ? 'network' : 'application',
        severity: error.name === 'TypeError' ? 'warning' : 'error'
      },
      user: this.props.user,
      level: error.name === 'TypeError' ? 'warning' : 'error'
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    this.props.onReset?.();
  };

  private isNetworkError(): boolean {
    const error = this.state.error;
    return error?.message.toLowerCase().includes('network') ||
           error?.message.toLowerCase().includes('fetch') ||
           error?.name === 'NetworkError' ||
           error?.name === 'TypeError';
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const isNetworkError = this.isNetworkError();

    return (
      <div 
        className="error-boundary p-6 rounded-lg bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-50 shadow-lg max-w-lg mx-auto my-8"
        role="alert"
        aria-live="polite"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            {isNetworkError ? 'Network Error' : 'Something went wrong'}
          </h2>
          
          <p className="text-sm">
            {isNetworkError 
              ? 'Please check your connection and try again.'
              : 'We apologize for the inconvenience. This error has been logged and we\'ll look into it.'}
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-800 rounded text-xs font-mono overflow-auto">
              <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reload Page
            </button>
          </div>

          {isNetworkError && (
            <p className="text-xs mt-2 text-red-700 dark:text-red-200">
              If the problem persists, you can try:
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>Checking your internet connection</li>
                <li>Clearing your browser cache</li>
                <li>Using a different network</li>
              </ul>
            </p>
          )}
        </div>
      </div>
    );
  }
}

// For TypeScript window object
declare global {
  interface Window {
    errorTracker?: (error: Error, context?: object) => void;
  }
}
