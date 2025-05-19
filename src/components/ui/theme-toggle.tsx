
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    return null;
  }

  const isDark = theme === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 h-9">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={isDark}
              onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle dark mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
