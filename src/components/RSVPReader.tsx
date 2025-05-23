
import { useRef, useEffect, useState } from "react";
import { useRSVPReader } from "@/hooks/useRSVPReader";
import { useFullscreen } from "@/hooks/useFullscreen";
import KeyboardControls from "./RSVPReader/KeyboardControls";
import TitleBar from "./RSVPReader/TitleBar";
import SourceLink from "./RSVPReader/SourceLink";
import WordDisplay from "./RSVPReader/WordDisplay";
import ProgressBar from "./RSVPReader/ProgressBar";
import PlaybackControls from "./RSVPReader/PlaybackControls";
import SpeedControl from "./RSVPReader/SpeedControl";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface RSVPReaderProps {
  text: string;
  contentId: string;
  title: string;
  source?: string;
  initialPosition?: number;
}

const RSVPReader = ({ text, contentId, title, source, initialPosition = 0 }: RSVPReaderProps) => {
  const readerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile, updatePreferredWpm } = useProfile();
  
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
    contentId,
    initialWpm: profile?.preferred_wpm || 300
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);

  // Auto-save WPM when it changes
  useEffect(() => {
    if (profile?.preferred_wpm && baseWpm !== profile.preferred_wpm) {
      // Debounce the WPM updates
      const saveTimer = setTimeout(() => {
        updatePreferredWpm(baseWpm);
        toast({
          title: "Reading Speed Saved",
          description: `Your preferred reading speed (${baseWpm} WPM) has been automatically saved.`,
        });
      }, 1500); // Wait 1.5 seconds after last change
      
      return () => clearTimeout(saveTimer);
    }
  }, [baseWpm, profile?.preferred_wpm, updatePreferredWpm, toast]);

  // Modified togglePlay function to save position when play state changes
  const togglePlay = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    // Save position when toggling play/pause
    if (!newPlayState && currentWordIndex > 0) {
      // Only save when pausing and we've read some content
      savePosition();
    }
  };
  
  // Modified navigation functions to save position
  const handleGoToNext = () => {
    goToNextWord();
    // No need to immediately save here as it would be excessive
    // The auto-save interval will handle periodic saves
  };
  
  const handleGoToPrevious = () => {
    goToPreviousWord();
    // No need to immediately save here as it would be excessive
    // The auto-save interval will handle periodic saves
  };
  
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
  }, [currentWordIndex, contentId, savePosition]);
  
  // Save position when reader is unmounted
  useEffect(() => {
    return () => {
      if (currentWordIndex > 0) {
        savePosition();
      }
    };
  }, [currentWordIndex, savePosition]);
  
  // Log progress for debugging
  useEffect(() => {
    console.log(`Current progress: ${progress}%, Word index: ${currentWordIndex}/${words.length}`);
  }, [progress, currentWordIndex, words.length]);
  
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
        onNext={handleGoToNext}
        onPrevious={handleGoToPrevious}
      />
      
      <TitleBar 
        title={title} 
        wordCount={words.length}
        isFullscreen={isFullscreen}
      />
      
      <SourceLink source={source} isFullscreen={isFullscreen} />

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
          onPrevious={handleGoToPrevious}
          onNext={handleGoToNext}
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
