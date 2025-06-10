import React from "react";
import { Slider } from "@/components/ui/slider";
import PlaybackControls from "./PlaybackControls";
import NotificationToggle from "./NotificationToggle";
import { Button } from "@/components/ui/button";
import { Gauge, RefreshCw, Pause, Play } from "lucide-react";

interface ControlsContainerProps {
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
  baseWpm: number;
  onWpmChange: (value: number[]) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSavePosition: () => Promise<boolean>;
  showNotifications: boolean;
  onToggleNotifications: () => void;
  isGlassesMode?: boolean;
}

const ControlsContainer = ({
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
  baseWpm,
  onWpmChange,
  isFullscreen,
  onToggleFullscreen,
  onSavePosition,
  showNotifications,
  onToggleNotifications,
  isGlassesMode = false
}: ControlsContainerProps) => {
  // In fullscreen glasses mode, show only simplified controls
  const isGlassesFullscreen = isFullscreen && isGlassesMode;

  console.log("isFullscreen", isFullscreen)

  if (isGlassesFullscreen) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="secondary"
            size="icon"
            onClick={onPlayPause}
            className="h-12 w-12"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button 
            variant="secondary"
            size="icon"
            onClick={onRestart}
            className="h-12 w-12"
          >
            <RefreshCw className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
      isFullscreen ? "absolute bottom-0 left-0 right-0" : ""
    }`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Speed Control Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Speed: {baseWpm} WPM
            </span>
          </div>
          
          {/* Speed Slider */}
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <span className="text-sm text-gray-500 font-medium">100</span>
            <div className="flex-1">
              <Slider
                value={[baseWpm]}
                onValueChange={onWpmChange}
                max={1000}
                min={100}
                step={25}
                className="w-full"
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">1K</span>
          </div>
        </div>

        {/* Playback Controls - using original component */}
        <PlaybackControls 
          isPlaying={isPlaying}
          isFullscreen={isFullscreen}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          onRestart={onRestart}
          disablePrevious={disablePrevious}
          disableNext={disableNext}
          smartPacingEnabled={smartPacingEnabled}
          onToggleSmartPacing={onToggleSmartPacing}
          currentWordIndex={currentWordIndex}
          totalWords={totalWords}
          effectiveWpm={effectiveWpm}
          isGlassesFullscreen={isGlassesFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          showNotifications={showNotifications}
          onToggleNotifications={onToggleNotifications}
          isGlassesMode={isGlassesMode}
        />

        {/* Status Information */}
        {/* <div className="flex items-center justify-center gap-6 mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Word {currentWordIndex + 1} of {totalWords}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Effective: {effectiveWpm} WPM
          </span>
        </div> */}

        {/* Toggle Controls - using original components */}
        {/* <div className="flex items-center justify-center gap-6">
          
          <NotificationToggle 
            showNotifications={showNotifications} 
            onToggle={onToggleNotifications}
            isGlassesMode={isGlassesMode}
          />
        </div> */}
      </div>
    </div>
  );
};

export default ControlsContainer;
