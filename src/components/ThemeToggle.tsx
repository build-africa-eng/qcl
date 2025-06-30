'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Avoid SSR issues
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const classList = document.documentElement.classList;
    if (dark) classList.add('dark');
    else classList.remove('dark');
  }, [dark, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <button
      onClick={() => setDark(prev => !prev)}
      className="text-sm px-3 py-1 rounded border dark:bg-gray-800 dark:text-white"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
