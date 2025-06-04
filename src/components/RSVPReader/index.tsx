import { useRef, useState } from "react";
import { useRSVPReader } from "@/hooks/useRSVPReader";
import { useFullscreen } from "@/hooks/useFullscreen";
import KeyboardControls from "./KeyboardControls";
import WordDisplay from "./WordDisplay";
import ProgressBar from "./ProgressBar";
import PlaybackControls from "./PlaybackControls";
import SpeedControl from "./SpeedControl";
import { BellOff, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string;
  initialPosition?: number;
  initialWpm?: number;
}

const RSVPReader = ({ 
  text, 
  contentId, 
  title, 
  source, 
  initialPosition = 0,
  initialWpm
}: RSVPReaderProps) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
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
    setShowToasts,
    savePosition
  } = useRSVPReader({ 
    text,
    initialShowToasts: showNotifications,
    contentId: contentId,
    initialPosition: initialPosition,
    initialWpm: initialWpm
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowToasts(!showNotifications);
  };
  
  return (
    <div 
      ref={readerRef} 
      className={`relative transition-all ${
        isFullscreen 
          ? "bg-gray-900 text-white" 
          : "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      }`}
    >
      <KeyboardControls 
        onPlayPause={togglePlay}
        onNext={goToNextWord}
        onPrevious={goToPreviousWord}
      />
      
      {/* Main reading area */}
      <div className={`flex flex-col items-center justify-center ${
        isFullscreen ? "h-screen" : "h-[50vh] sm:h-[60vh] lg:h-[70vh]"
      }`}>
        <WordDisplay 
          before={formattedWord.before}
          highlight={formattedWord.highlight}
          after={formattedWord.after}
          isFullscreen={isFullscreen}
        />
        
        <ProgressBar progress={progress} complexity={currentComplexity} />
      </div>
      
      {/* Controls */}
      <div className={`p-3 sm:p-4 lg:p-6 ${isFullscreen ? "absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm" : ""}`}>
        <PlaybackControls 
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
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
        />
        
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleNotifications}
            className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
          >
            {showNotifications ? (
              <>
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications On</span>
                <span className="sm:hidden">On</span>
              </>
            ) : (
              <>
                <BellOff className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notifications Off</span>
                <span className="sm:hidden">Off</span>
              </>
            )}
          </Button>
        </div>
        
        <SpeedControl 
          baseWpm={baseWpm}
          onWpmChange={handleWpmChange}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onSavePosition={savePosition}
        />
      </div>
    </div>
  );
};

export default RSVPReader;
