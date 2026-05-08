"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full bg-surface-container-low" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="group cursor-pointer relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-outline-variant/30 transition-all duration-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun Icon — visible in light mode */}
      <Sun
        className={`absolute h-5 w-5 transition-all duration-500 ease-in-out
          ${theme === "dark"
            ? "translate-y-0 rotate-0 opacity-100"
            : "translate-y-10 rotate-90 opacity-0"
          }`}
      />

      {/* Moon Icon — visible in dark mode */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-500 ease-in-out
          ${theme === "light"
            ? "translate-y-0 rotate-0 opacity-100"
            : "-translate-y-10 -rotate-90 opacity-0"
          }`}
      />

      <span className="absolute inset-0 rounded-full border border-outline-variant/10 group-hover:border-primary/20 transition-colors" />
    </button>
  );
}