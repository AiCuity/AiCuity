
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
  onSavePosition?: () => void; // Optional prop to manually save position
}

const SpeedControl = ({ 
  baseWpm, 
  onWpmChange, 
  isFullscreen, 
  onToggleFullscreen,
  onSavePosition 
}: SpeedControlProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Make sure baseWpm is a number
  const wpmValue = typeof baseWpm === 'number' ? baseWpm : 
                  Array.isArray(baseWpm) ? baseWpm[0] : 300;
  
  // Show saving indicator briefly when WPM changes
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      setIsSaving(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [wpmValue]);

  // Handle WPM change with debounce
  const handleWpmChange = (values: number[]) => {
    // Make sure we're passing a clean number value
    console.log("SpeedControl - WPM change:", values[0]);
    
    // Call the parent handler
    onWpmChange(values);
    
    // Show saving indicator
    setIsSaving(true);
    
    // If we have a manual save function, call it after a delay
    if (onSavePosition) {
      const saveTimer = setTimeout(() => {
        console.log("SpeedControl - calling save position with WPM:", wpmValue);
        onSavePosition();
      }, 1500);
      
      return () => clearTimeout(saveTimer);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Reading Speed: {wpmValue} WPM</span>
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
                value={[wpmValue]}
                min={100}
                max={1000}
                step={10}
                onValueChange={handleWpmChange}
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
