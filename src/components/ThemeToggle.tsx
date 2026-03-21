"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ className, style }: { className?: string, style?: React.CSSProperties }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    setTheme(savedTheme as "light" | "dark");
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return null;

  const defaultStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 9999,
    backgroundColor: 'var(--bg-pane)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    fontSize: '1.5rem',
    transition: 'all 0.3s ease'
  };

  return (
    <button
      onClick={toggleTheme}
      className={className}
      style={style || defaultStyle}
      aria-label="Alternar tema"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
