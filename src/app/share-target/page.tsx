import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ShareTarget: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    async function handleShare() {
      try {
        const formData = await (window as any).launchQueue?.files?.[0]?.getAsFormData();
        if (!formData) return;

        const title = formData.get('title');
        const text = formData.get('text');
        const url = formData.get('url');

        // Process the shared content
        // For example, create a new flashcard or add to study list
        const data = { title, text, url };
        
        // Store in IndexedDB for offline access
        if ('indexedDB' in window) {
          const db = await openDatabase();
          const tx = db.transaction('shared_content', 'readwrite');
          const store = tx.objectStore('shared_content');
          await store.add(data);
        }

        // Navigate to appropriate view
        router.push('/session');
      } catch (error) {
        console.error('Error handling share:', error);
      }
    }

    if (document.readyState === 'complete') {
      handleShare();
    } else {
      window.addEventListener('load', handleShare);
      return () => window.removeEventListener('load', handleShare);
    }
  }, [router]);

  return null; // This is just a handler page, no UI needed
};

async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('MeridianMastery', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('shared_content')) {
        db.createObjectStore('shared_content', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export default ShareTarget;
