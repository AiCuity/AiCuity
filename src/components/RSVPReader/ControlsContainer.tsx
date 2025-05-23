
import React from "react";
import PlaybackControls from "./PlaybackControls";
import SpeedControl from "./SpeedControl";
import NotificationToggle from "./NotificationToggle";
import RestartButton from "./RestartButton";

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
  onToggleNotifications
}: ControlsContainerProps) => {
  return (
    <div className={`p-4 ${isFullscreen ? "absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm" : ""}`}>
      <PlaybackControls 
        isPlaying={isPlaying}
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
      />
      
      <div className="flex items-center justify-center gap-4 mb-4">
        <RestartButton onClick={onRestart} />
        <NotificationToggle 
          showNotifications={showNotifications} 
          onToggle={onToggleNotifications} 
        />
      </div>
      
      <SpeedControl 
        baseWpm={baseWpm}
        onWpmChange={onWpmChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onSavePosition={onSavePosition}
      />
    </div>
  );
};

export default ControlsContainer;
