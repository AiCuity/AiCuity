
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('vite-ui-theme', 'dark');
  }, []);

  return (
    <NextThemesProvider 
      {...props} 
      defaultTheme="dark" 
      forcedTheme="dark"
      enableSystem={false}
      enableColorScheme={false}
    >
      {children}
    </NextThemesProvider>
  );
}
