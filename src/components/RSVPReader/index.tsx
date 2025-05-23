
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
          : "bg-white dark:bg-gray-900 dark:text-white"
      }`}
    >
      <KeyboardControls 
        onPlayPause={togglePlay}
        onNext={goToNextWord}
        onPrevious={goToPreviousWord}
      />
      
      {/* Main reading area */}
      <div className={`flex flex-col items-center justify-center ${
        isFullscreen ? "h-screen" : "h-[50vh] md:h-[60vh]"
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
      <div className={`p-4 ${isFullscreen ? "absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm" : ""}`}>
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
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleNotifications}
            className="flex items-center gap-1"
          >
            {showNotifications ? (
              <>
                <Bell className="h-4 w-4" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                Notifications Off
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
