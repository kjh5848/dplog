import React from 'react';

export const FloatingControls = () => {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
      <button className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
        <span className="material-icons-round">headset_mic</span>
      </button>
      <button 
        className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all"
        onClick={toggleDarkMode}
      >
        <span className="material-icons-round">dark_mode</span>
      </button>
    </div>
  );
};
