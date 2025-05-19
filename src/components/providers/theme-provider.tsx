
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force the document to adopt the chosen theme
  React.useEffect(() => {
    const theme = localStorage.getItem('vite-ui-theme') || props.defaultTheme || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark class based on stored preference or system preference
    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [props.defaultTheme]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
