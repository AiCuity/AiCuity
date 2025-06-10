import { useRef } from "react";
import { useRSVPReader } from "@/hooks/useRSVPReader";
import { useFullscreen } from "@/hooks/useFullscreen";
import KeyboardControls from "./RSVPReader/KeyboardControls";
import TitleBar from "./RSVPReader/TitleBar";
import SourceLink from "./RSVPReader/SourceLink";
import ReadingArea from "./RSVPReader/ReadingArea";
import ControlsContainer from "./RSVPReader/ControlsContainer";
import { useNotifications } from "@/hooks/rsvp/useNotifications";

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string;
  initialPosition?: number;
  initialWpm?: number;
  isGlassesMode?: boolean;
  onCloseReader?: () => void;
}

const RSVPReader = ({ 
  text, 
  contentId, 
  title, 
  source, 
  initialPosition = 0,
  initialWpm,
  isGlassesMode = false,
  onCloseReader
}: RSVPReaderProps) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const { showNotifications, setShowNotifications, toggleNotifications } = useNotifications(false);
  
  const {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    effectiveWpm,
    smartPacingEnabled,
    currentComplexity,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading,
    savePosition,
    setShowToasts
  } = useRSVPReader({ 
    text, 
    initialPosition, 
    contentId,
    initialWpm: initialWpm || undefined,
    initialShowToasts: showNotifications
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);

  // Toggle notifications handler
  const handleToggleNotifications = () => {
    toggleNotifications();
    setShowToasts(!showNotifications);
  };

  return (
    <div 
      ref={readerRef} 
      className={`relative transition-all ${
        isFullscreen 
          ? "bg-gray-900 text-white" 
          : "bg-white dark:bg-gray-900 dark:text-white"
      }`}
    >
      <KeyboardControls 
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={goToNextWord}
        onPrevious={goToPreviousWord}
      />
      
      <TitleBar 
        title={title} 
        wordCount={words.length}
        isFullscreen={isFullscreen}
        isGlassesMode={isGlassesMode}
        contentId={contentId}
        onCloseReader={onCloseReader}
        source={source}
      />
      
      {/* <SourceLink source={source} isFullscreen={isFullscreen} /> */}

      <ReadingArea
        isFullscreen={isFullscreen}
        formattedWord={formattedWord}
        progress={progress}
        currentComplexity={currentComplexity}
        isGlassesMode={isGlassesMode}
      />
      
      <ControlsContainer
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onPrevious={goToPreviousWord}
        onNext={goToNextWord}
        onRestart={restartReading}
        disablePrevious={currentWordIndex <= 0}
        disableNext={currentWordIndex >= words.length - 1}
        smartPacingEnabled={smartPacingEnabled}
        onToggleSmartPacing={toggleSmartPacing}
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        effectiveWpm={effectiveWpm}
        baseWpm={baseWpm}
        onWpmChange={handleWpmChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onSavePosition={savePosition}
        showNotifications={showNotifications}
        onToggleNotifications={handleToggleNotifications}
        isGlassesMode={isGlassesMode}
      />
    </div>
  );
};

export default RSVPReader;
