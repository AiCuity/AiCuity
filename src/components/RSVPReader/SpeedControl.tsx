
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Maximize, Minimize, Save } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface SpeedControlProps {
  baseWpm: number;
  onWpmChange: (value: number[]) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const SpeedControl = ({ baseWpm, onWpmChange, isFullscreen, onToggleFullscreen }: SpeedControlProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Show saving indicator briefly when WPM changes
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [baseWpm]);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Reading Speed: {baseWpm} WPM</span>
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3 animate-pulse" />
              Auto-saving...
            </span>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="icon"
                onClick={onToggleFullscreen}
                type="button"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-4">
              <span className="text-xs">100</span>
              <Slider
                value={[baseWpm]}
                min={100}
                max={1000}
                step={10}
                onValueChange={onWpmChange}
                className="flex-1"
              />
              <span className="text-xs">1000</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust reading speed (words per minute)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SpeedControl;
