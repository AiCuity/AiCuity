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
      <div className="max-w-xs sm:max-w-lg mx-auto">
        <TooltipProvider>
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={buttonVariant}
                  size="icon"
                  onClick={handlePlayPause}
                  type="button"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  className="h-10 w-10 sm:h-12 sm:w-12"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
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
                    className="h-10 w-10 sm:h-12 sm:w-12"
                  >
                    <Minimize className="h-4 w-4 sm:h-5 sm:w-5" />
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
    <div className="max-w-xs sm:max-w-lg mx-auto">
      {/* Reading controls with tooltips */}
      <TooltipProvider>
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={buttonVariant} 
                size="icon"
                onClick={handlePrevious}
                disabled={disablePrevious}
                type="button"
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
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
                className="w-20 sm:w-24 h-10 sm:h-11 text-xs sm:text-sm"
                type="button"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Play</span>
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
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
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
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next word (Right Arrow)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      {/* Word count and effective WPM */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
        <span className="font-medium">Word {currentWordIndex + 1} of {totalWords}</span>
        {smartPacingEnabled && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Effective: {effectiveWpm} WPM
          </span>
        )}
      </div>
      
      <TooltipProvider>
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={smartPacingEnabled ? buttonVariant : "outline"}
                size="sm"
                onClick={handleToggleSmartPacing}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
                type="button"
              >
                <Gauge className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                  {smartPacingEnabled ? "Smart Pacing On" : "Smart Pacing Off"}
                </span>
                <span className="sm:hidden">
                  {smartPacingEnabled ? "Smart On" : "Smart Off"}
                </span>
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
