
import { useRef, useEffect } from "react";
import { useRSVPReader } from "@/hooks/useRSVPReader";
import { useFullscreen } from "@/hooks/useFullscreen";
import KeyboardControls from "./RSVPReader/KeyboardControls";
import TitleBar from "./RSVPReader/TitleBar";
import SourceLink from "./RSVPReader/SourceLink";
import WordDisplay from "./RSVPReader/WordDisplay";
import ProgressBar from "./RSVPReader/ProgressBar";
import PlaybackControls from "./RSVPReader/PlaybackControls";
import SpeedControl from "./RSVPReader/SpeedControl";
import { Button } from "./ui/button";
import { BookmarkIcon } from "lucide-react";

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string;
  initialPosition?: number;
}

const RSVPReader = ({ text, contentId, title, source, initialPosition = 0 }: RSVPReaderProps) => {
  const readerRef = useRef<HTMLDivElement>(null);
  
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
    savePosition
  } = useRSVPReader({ 
    text, 
    initialPosition, 
    contentId 
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  // Save position when user exits the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePosition();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      savePosition();
    };
  }, [currentWordIndex, contentId]);
  
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
      
      <TitleBar 
        title={title} 
        wordCount={words.length}
        isFullscreen={isFullscreen}
      />
      
      <SourceLink source={source} isFullscreen={isFullscreen} />

      {/* Save position button */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className={`${isFullscreen ? 'bg-gray-800 hover:bg-gray-700' : ''}`}
          onClick={() => savePosition()}
          type="button"
        >
          <BookmarkIcon className="w-4 h-4 mr-2" />
          Save Position
        </Button>
      </div>

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
        
        <SpeedControl 
          baseWpm={baseWpm}
          onWpmChange={handleWpmChange}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};

export default RSVPReader;
