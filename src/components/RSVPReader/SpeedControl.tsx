import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Maximize, Minimize, Save, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [localWpm, setLocalWpm] = useState<number>(300); // Local state to track WPM
  
  // Make sure baseWpm is a number
  const wpmValue = typeof baseWpm === 'number' ? baseWpm : 
                  Array.isArray(baseWpm) ? baseWpm[0] : 300;
  
  // Initialize local state from props
  useEffect(() => {
    setLocalWpm(wpmValue);
    console.log("SpeedControl - Initialized with WPM:", wpmValue);
  }, []);
  
  // Update local state when baseWpm changes
  useEffect(() => {
    if (wpmValue !== localWpm) {
      console.log("SpeedControl - WPM updated from props:", wpmValue);
      setLocalWpm(wpmValue);
    }
  }, [wpmValue]);
  
  console.log("SpeedControl - WPM type:", typeof baseWpm, "Value:", baseWpm);
  console.log("SpeedControl - Normalized WPM value:", wpmValue);
  console.log("SpeedControl - Local WPM value:", localWpm);
  
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
    const newWpm = values[0];
    console.log("SpeedControl - WPM change:", newWpm);
    
    // Update local state
    setLocalWpm(newWpm);
    
    // Call the parent handler
    onWpmChange(values);
    
    // Show saving indicator
    setIsSaving(true);
    
    // If we have a manual save function, call it after a delay
    if (onSavePosition) {
      const saveTimer = setTimeout(() => {
        console.log("SpeedControl - calling save position with WPM:", newWpm);
        onSavePosition();
      }, 1500);
      
      return () => clearTimeout(saveTimer);
    }
  };
  
  // Handle calibration button click
  const handleCalibrationClick = () => {
    navigate('/speed-calibration');
  };

  return (
    <div className="max-w-xs sm:max-w-lg mx-auto space-y-3 sm:space-y-4">
      <Separator className="my-3 sm:my-4" />
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium">Speed: {localWpm} WPM</span>
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3 animate-pulse" />
              <span className="hidden sm:inline">Auto-saving...</span>
              <span className="sm:hidden">Saving...</span>
            </span>
          )}
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCalibrationClick}
                  type="button"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Gauge className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calibrate your reading speed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon"
                  onClick={onToggleFullscreen}
                  type="button"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                >
                  {isFullscreen ? (
                    <Minimize className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 sm:gap-4 px-1">
              <span className="text-xs font-mono">100</span>
              <Slider
                value={[localWpm]} 
                min={100}
                max={1000}
                step={10}
                onValueChange={handleWpmChange}
                className="flex-1 touch-manipulation"
              />
              <span className="text-xs font-mono">1K</span>
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
