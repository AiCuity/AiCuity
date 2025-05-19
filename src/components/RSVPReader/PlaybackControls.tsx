
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Gauge } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
  smartPacingEnabled: boolean;
  onToggleSmartPacing: () => void;
}

const PlaybackControls = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
  smartPacingEnabled,
  onToggleSmartPacing
}: PlaybackControlsProps) => {
  return (
    <div className="max-w-lg mx-auto">
      {/* Reading controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onPrevious}
          disabled={disablePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={onPlayPause}
          className="w-24"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Play
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={onNext}
          disabled={disableNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <Button
          variant={smartPacingEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleSmartPacing}
          className="flex items-center gap-1"
        >
          <Gauge className="h-4 w-4" />
          {smartPacingEnabled ? "Smart Pacing On" : "Smart Pacing Off"}
        </Button>
      </div>
    </div>
  );
};

export default PlaybackControls;
