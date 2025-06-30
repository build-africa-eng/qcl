// src/components/ThemeToggle.tsx
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (dark) classList.add('dark');
    else classList.remove('dark');
  }, [dark]);

  return (
    <button
      onClick={() => setDark(prev => !prev)}
      className="text-sm px-3 py-1 rounded border dark:bg-gray-800 dark:text-white"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
