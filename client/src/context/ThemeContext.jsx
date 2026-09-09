import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const PRESETS = {
  light: {
    accent: '#b98a2f',
    accent2: '#8a6a1f',
    bg: '#faf7f2',
    surface: '#ffffff',
    text: '#1c1a17',
    muted: '#8a8378',
    border: '#e8e1d4',
    navBg: 'rgba(250, 247, 242, 0.85)',
  },
  dark: {
    accent: '#d4a94e',
    accent2: '#f0cf8a',
    bg: '#0d0c10',
    surface: '#16151b',
    text: '#f7f4ee',
    muted: '#aaa4b6',
    border: '#34303e',
    navBg: 'rgba(13, 12, 16, 0.85)',
  },
};

const CUSTOM_DEFAULT = {
  accent: '#c0517e',
  accent2: '#7c3f58',
  bg: '#fdf3f7',
  surface: '#ffffff',
  text: '#2a1a22',
  muted: '#8f7a83',
  border: '#eed4de',
  navBg: 'rgba(253, 243, 247, 0.85)',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('sc_theme') || 'light');
  const [custom, setCustom] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sc_custom')) || CUSTOM_DEFAULT;
    } catch {
      return CUSTOM_DEFAULT;
    }
  });

  useEffect(() => {
    const vars = theme === 'custom' ? custom : PRESETS[theme];
    const root = document.documentElement;
    root.dataset.theme = theme;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
    localStorage.setItem('sc_theme', theme);
    localStorage.setItem('sc_custom', JSON.stringify(custom));
  }, [theme, custom]);

  const value = { theme, setTheme, custom, setCustom, presets: PRESETS, customDefault: CUSTOM_DEFAULT };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
