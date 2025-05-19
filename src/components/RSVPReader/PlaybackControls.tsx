
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Gauge, RefreshCw } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
  smartPacingEnabled: boolean;
  onToggleSmartPacing: () => void;
  currentWordIndex: number;
  totalWords: number;
  effectiveWpm: number;
}

const PlaybackControls = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onRestart,
  disablePrevious,
  disableNext,
  smartPacingEnabled,
  onToggleSmartPacing,
  currentWordIndex,
  totalWords,
  effectiveWpm
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
          onClick={onRestart}
          title="Restart"
        >
          <RefreshCw className="h-4 w-4" />
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
      
      {/* Word count and effective WPM */}
      <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Word {currentWordIndex + 1} of {totalWords}</span>
        {smartPacingEnabled && (
          <span className="text-blue-600 dark:text-blue-400">
            Effective: {effectiveWpm} WPM
          </span>
        )}
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
