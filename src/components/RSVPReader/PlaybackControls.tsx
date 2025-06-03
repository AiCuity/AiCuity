import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Gauge, RefreshCw, Minimize } from "lucide-react";
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
  isGlassesFullscreen?: boolean;
  onToggleFullscreen?: () => void;
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
  effectiveWpm,
  isGlassesFullscreen = false,
  onToggleFullscreen
}: PlaybackControlsProps) => {
  // Fixed function to handle play/pause that prevents default behavior
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Play/Pause clicked, current state:", isPlaying);
    // This will now trigger saving to Supabase on pause via the useEffect in useHistoryTracker
    onPlayPause();
  };

  // Functions to prevent default behavior for all controls
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    onPrevious();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.preventDefault();
    onRestart();
  };

  const handleToggleSmartPacing = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleSmartPacing();
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  // Button variant to ensure all buttons have the same style
  const buttonVariant = "default";

  // In glasses fullscreen mode, show only Play/Pause, Restart, and Exit Fullscreen
  if (isGlassesFullscreen) {
    return (
      <div className="max-w-lg mx-auto">
        <TooltipProvider>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={buttonVariant}
                  size="icon"
                  onClick={handlePlayPause}
                  type="button"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
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
                  variant={buttonVariant} 
                  size="icon"
                  onClick={handleRestart}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restart reading</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Exit fullscreen button for glasses mode */}
            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={buttonVariant} 
                    size="icon"
                    onClick={handleToggleFullscreen}
                    type="button"
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exit fullscreen</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
    );
  }

  // Standard mode with all controls
  return (
    <div className="max-w-lg mx-auto">
      {/* Reading controls with tooltips */}
      <TooltipProvider>
        <div className="flex items-center justify-center gap-4 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={buttonVariant} 
                size="icon"
                onClick={handlePrevious}
                disabled={disablePrevious}
                type="button"
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
                variant={buttonVariant}
                onClick={handlePlayPause}
                className="w-24"
                type="button"
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
                variant={buttonVariant} 
                size="icon"
                onClick={handleRestart}
                type="button"
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
                variant={buttonVariant} 
                size="icon"
                onClick={handleNext}
                disabled={disableNext}
                type="button"
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
                variant={smartPacingEnabled ? buttonVariant : "outline"}
                size="sm"
                onClick={handleToggleSmartPacing}
                className="flex items-center gap-1"
                type="button"
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
