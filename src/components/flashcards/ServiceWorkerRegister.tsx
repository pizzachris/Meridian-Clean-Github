"use client";
import { useEffect, useState } from "react";
import type { FC, ReactElement } from "react";

const ServiceWorkerRegister: FC = function ServiceWorkerRegister(): ReactElement | null {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [offlineReady, setOfflineReady] = useState<boolean>(false);
  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    async function handleRegistration() {
      try {
        // Clean up existing registrations
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(existingRegistrations.map(reg => reg.unregister()));

        // Register new service worker with timeout
        const newRegistration = await Promise.race([
          navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
            updateViaCache: 'none'
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Registration timeout')), 10000)
          ),
        ]);

        setRegistration(newRegistration);

        if (newRegistration.active) {
          setOfflineReady(true);
        }

        // Handle updates
        newRegistration.addEventListener('updatefound', () => {
          const worker = newRegistration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            } else if (worker.state === 'activated') {
              setOfflineReady(true);
            }
          });
        });

        // Set up periodic update checks
        const checkForUpdates = async () => {
          try {
            await newRegistration.update();
          } catch (error) {
            console.debug('Update check failed:', error);
          }
        };

        // Check for updates when online/focused
        const updateOnlineStatus = () => {
          if (navigator.onLine) {
            checkForUpdates().catch(console.error);
          }
        };

        const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('focus', updateOnlineStatus);

        // Cleanup
        return () => {
          clearInterval(interval);
          window.removeEventListener('online', updateOnlineStatus);
          window.removeEventListener('focus', updateOnlineStatus);
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Service Worker registration failed:', message);
        setRegistrationError(message);
      }
    }
    
    handleRegistration();
  }, []);  // Handle update action
  const handleUpdate = async () => {
    if (!registration?.waiting) return;
    
    try {
      // Set up controllerchange handler
      const waitForController = new Promise<void>((resolve) => {
        const onControllerChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      });

      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Save any unsaved state
      const userProgress = localStorage.getItem('userProgress');
      if (userProgress) {
        sessionStorage.setItem('pendingProgress', userProgress);
      }

      // Wait for activation with timeout
      await Promise.race([
        waitForController,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Update timeout')), 10000)
        ),
      ]);

      // Reload the page
      setTimeout(() => window.location.reload(), 200);
    } catch (error) {
      console.error('Update failed:', error);
      window.location.reload();
    }
  };

  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return undefined;
    }

    const cleanupRegistration = async () => {
      try {
        // Clean up existing registrations
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(existingRegistrations.map(reg => reg.unregister()));

        // Register new service worker with timeout
        const newRegistration = await Promise.race([
          navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
            updateViaCache: 'none'
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Registration timeout')), 10000)
          ),
        ]);

        setRegistration(newRegistration);

        if (newRegistration.active) {
          setOfflineReady(true);
        }

        const updateCheck = async () => {
          try {
            await newRegistration.update();
          } catch (err) {
            console.debug('Update check failed:', err);
          }
        };

        const onUpdateFound = () => {
          const worker = newRegistration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            } else if (worker.state === 'activated') {
              setOfflineReady(true);
            }
          });
        };

        // Set up update checks
        const interval = setInterval(updateCheck, 60 * 60 * 1000);
        const updateOnOnline = () => navigator.onLine && updateCheck();

        newRegistration.addEventListener('updatefound', onUpdateFound);
        window.addEventListener('online', updateOnOnline);
        window.addEventListener('focus', updateOnOnline);

        return () => {
          clearInterval(interval);
          newRegistration.removeEventListener('updatefound', onUpdateFound);
          window.removeEventListener('online', updateOnOnline);
          window.removeEventListener('focus', updateOnOnline);
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Service Worker registration failed:', message);
        setRegistrationError(message);
        return undefined;
      }
    };

    cleanupRegistration();
    return () => {};
  }, []);

  // Render notifications
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-[var(--maroon-primary)] text-[var(--gold-primary)] p-4 rounded-xl shadow-lg z-50 max-w-xs animate-fade-in">
        <p className="text-sm">A new version is available!</p>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-[var(--gold-primary)] text-black px-4 py-1 rounded-lg text-sm font-bold hover:bg-[var(--gold-hover)] transition"
          >
            Update Now
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="px-4 py-1 rounded-lg text-sm font-bold hover:bg-[var(--maroon-hover)] transition border border-[var(--gold-primary)]"
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  if (offlineReady) {
    setTimeout(() => setOfflineReady(false), 3000);
    return (
      <div className="fixed bottom-4 right-4 bg-[var(--maroon-primary)] text-[var(--gold-primary)] p-4 rounded-xl shadow-lg z-50 max-w-xs animate-fade-in">
        <p className="text-sm">✓ Ready to work offline</p>
      </div>
    );
  }

  if (registrationError) {
    return (
      <div className="fixed bottom-4 right-4 bg-[var(--maroon-primary)] text-[var(--gold-primary)] p-4 rounded-xl shadow-lg z-50 max-w-xs">
        <p className="text-sm mb-2">Failed to enable offline mode: {registrationError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[var(--gold-primary)] text-black px-4 py-1 rounded-lg text-sm font-bold hover:bg-[var(--gold-hover)] transition w-full"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
}

export default ServiceWorkerRegister;
