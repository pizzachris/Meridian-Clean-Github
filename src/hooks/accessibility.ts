import { useRef, useEffect, useCallback, KeyboardEvent } from 'react';

interface UseTrapFocusOptions {
  isActive?: boolean;
  autoFocus?: boolean;
}

export function useTrapFocus({ isActive = true, autoFocus = true }: UseTrapFocusOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(element => !element.hasAttribute('disabled'));
  }, []);

  useEffect(() => {
    if (!isActive) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown as any);
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown as any);
      }
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, autoFocus, getFocusableElements]);

  return containerRef;
}

export function useSkipLink(contentId: string) {
  useEffect(() => {
    const handleSkipLinkClick = (event: MouseEvent) => {
      event.preventDefault();
      const contentElement = document.getElementById(contentId);
      if (contentElement) {
        contentElement.focus();
        contentElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const skipLink = document.querySelector<HTMLAnchorElement>('[data-skip-link]');
    if (skipLink) {
      skipLink.addEventListener('click', handleSkipLinkClick);
    }

    return () => {
      if (skipLink) {
        skipLink.removeEventListener('click', handleSkipLinkClick);
      }
    };
  }, [contentId]);
}

interface UseAriaAnnounceOptions {
  timeout?: number;
}

export function useAriaAnnounce({ timeout = 3000 }: UseAriaAnnounceOptions = {}) {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = '';
      // Force a reflow
      void announceRef.current.offsetHeight;
      announceRef.current.textContent = message;

      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, timeout);
    }
  }, [timeout]);

  return {
    announce,
    announceRef
  };
}

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return event.key.toLowerCase() === shortcut.key.toLowerCase() &&
               event.ctrlKey === !!shortcut.ctrlKey &&
               event.shiftKey === !!shortcut.shiftKey &&
               event.altKey === !!shortcut.altKey &&
               event.metaKey === !!shortcut.metaKey;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
