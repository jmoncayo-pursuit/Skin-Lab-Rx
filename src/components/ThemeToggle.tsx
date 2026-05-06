"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else if (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Optional: uncomment if you want to default to system dark mode
      // setIsDark(true);
      // document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.2rem',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.3s ease'
      }}
      aria-label="Toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
