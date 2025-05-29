import { render } from '@testing-library/react';
import ServiceWorkerRegister from '../ServiceWorkerRegister';

// Mock Node environment
const originalEnv = process.env.NODE_ENV;
const mockEnv = (env: string) => {
  Object.defineProperty(process, 'env', {
    value: { ...process.env, NODE_ENV: env },
    configurable: true
  });
};

// Mock service worker registration
const mockRegister = jest.fn();
const mockUnregister = jest.fn();

Object.defineProperty(window, 'navigator', {
  value: {
    serviceWorker: {
      register: mockRegister,
      getRegistrations: jest.fn().mockResolvedValue([{ unregister: mockUnregister }])
    }
  },
  configurable: true
});

describe('ServiceWorkerRegister', () => {
  beforeEach(() => {
    mockRegister.mockClear();
    mockUnregister.mockClear();
  });
  it('registers service worker in production', () => {
    mockEnv('production');
    render(<ServiceWorkerRegister />);
    
    expect(mockRegister).toHaveBeenCalledWith('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    mockEnv(originalEnv); // restore original environment
  });

  it('does not register service worker in development', () => {
    mockEnv('development');
    render(<ServiceWorkerRegister />);
    
    expect(mockRegister).not.toHaveBeenCalled();
    mockEnv(originalEnv); // restore original environment
  });
  it('handles registration errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockRegister.mockRejectedValueOnce(new Error('Failed to register'));

    mockEnv('production');
    render(<ServiceWorkerRegister />);

    await expect(mockRegister).rejects.toThrow('Failed to register');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
    mockEnv(originalEnv); // restore original environment
  });

  it('unregisters existing service workers before registering new one', async () => {
    mockEnv('production');
    render(<ServiceWorkerRegister />);

    expect(mockUnregister).toHaveBeenCalled();
    expect(mockRegister).toHaveBeenCalled();
    mockEnv(originalEnv); // restore original environment
  });
});
