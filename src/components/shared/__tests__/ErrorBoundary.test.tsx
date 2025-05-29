import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import React from 'react';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected error throws in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
      return null;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('handles network errors appropriately', () => {
    const NetworkError = () => {
      throw new Error('Failed to fetch');
      return null;
    };

    render(
      <ErrorBoundary>
        <NetworkError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByText(/check your connection/i)).toBeInTheDocument();
  });

  it('resets error state when try again is clicked', () => {
    const mockReset = jest.fn();    const error = new Error('Test error');
    const ref = React.createRef<ErrorBoundary>();
    render(
      <ErrorBoundary ref={ref} onReset={mockReset}>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    // Manually trigger error using the ref
    ref.current?.componentDidCatch(error, { componentStack: '' });

    // Since componentDidCatch is async, wait for UI update
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalled();
  });

  it('logs errors to error tracking service', () => {
    const mockErrorTracker = jest.fn();
    window.errorTracker = mockErrorTracker;    const error = new Error('Test error');
    const ref = React.createRef<ErrorBoundary>();
    render(
      <ErrorBoundary ref={ref}>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    // Manually trigger error using the ref
    ref.current?.componentDidCatch(error, { componentStack: '' });

    expect(mockErrorTracker).toHaveBeenCalledWith(error);
  });
});
