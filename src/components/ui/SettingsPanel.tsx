import React, { useState } from 'react';

const SettingsPanel: React.FC = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const resetProgress = () => {
    localStorage.removeItem('reviewed');
    localStorage.removeItem('progress');
    window.location.reload();
  };

  return (
    <div className="bg-card p-4 rounded shadow text-white max-w-xs mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2 text-secondary">Settings</h2>
      <div className="flex flex-col gap-4">
        <button
          className="bg-secondary text-black px-4 py-2 rounded font-bold shadow hover:bg-yellow-400 transition"
          onClick={toggleDark}
        >
          {dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button
          className="bg-accent text-white px-4 py-2 rounded font-bold shadow hover:bg-red-700 transition"
          onClick={resetProgress}
        >
          Reset Progress
        </button>
      </div>
      <div className="text-sm text-gray-300 mt-4">(More settings coming soon)</div>
    </div>
  );
};

export default SettingsPanel;
