
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Gauge, RefreshCw } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
      {/* Reading controls with tooltips */}
      <TooltipProvider>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onPrevious}
                disabled={disablePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous word (Left Arrow)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Play/Pause (Space)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onRestart}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Restart reading</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={onNext}
                disabled={disableNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next word (Right Arrow)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      {/* Word count and effective WPM */}
      <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Word {currentWordIndex + 1} of {totalWords}</span>
        {smartPacingEnabled && (
          <span className="text-blue-600 dark:text-blue-400">
            Effective: {effectiveWpm} WPM
          </span>
        )}
      </div>
      
      <TooltipProvider>
        <div className="flex items-center justify-center mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={smartPacingEnabled ? "default" : "outline"}
                size="sm"
                onClick={onToggleSmartPacing}
                className="flex items-center gap-1"
              >
                <Gauge className="h-4 w-4" />
                {smartPacingEnabled ? "Smart Pacing On" : "Smart Pacing Off"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust reading speed based on text complexity</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default PlaybackControls;
