
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Maximize, Minimize } from "lucide-react";

interface SpeedControlProps {
  baseWpm: number;
  onWpmChange: (value: number[]) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const SpeedControl = ({ baseWpm, onWpmChange, isFullscreen, onToggleFullscreen }: SpeedControlProps) => {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Separator className="my-4" />
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Base Speed: {baseWpm} WPM</span>
        <Button 
          variant="primary" 
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
      </div>
      
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
    </div>
  );
};

export default SpeedControl;
