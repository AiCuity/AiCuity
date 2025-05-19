
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before rendering theme-specific elements
  // This prevents hydration mismatch errors by only rendering after client-side JavaScript is available
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply dark mode class directly to document element when theme changes
  useEffect(() => {
    if (mounted) {
      const isDark = theme === "dark" || 
                    (theme === "system" && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <span className="sr-only">Toggle theme</span>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
