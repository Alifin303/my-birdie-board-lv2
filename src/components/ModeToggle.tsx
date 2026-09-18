
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ModeToggleProps {
  showLabel?: boolean;
}

export function ModeToggle({ showLabel = false }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size={showLabel ? "sm" : "icon"}
      className={showLabel ? "gap-2" : undefined}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel ? <span>{isDark ? "Light mode" : "Dark mode"}</span> : <span className="sr-only">Toggle theme</span>}
    </Button>
  );
}
