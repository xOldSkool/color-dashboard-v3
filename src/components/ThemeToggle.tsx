'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!theme) return null;

  return <div onClick={toggleTheme}>{theme === 'dark' ? <Sun className="size-6" /> : <Moon className="size-6" />}</div>;
}
