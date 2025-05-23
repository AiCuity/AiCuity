
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
    savePosition,
    showToasts,
    setShowToasts
  } = useRSVPReader({ 
    text, 
    initialPosition, 
    contentId,
    initialWpm: profile?.preferred_wpm || 300
  });
  
  const { isFullscreen, toggleFullscreen } = useFullscreen(readerRef);
  const [showToastsState, setShowToastsState] = useState(true);

  // Auto-save WPM when it changes
  useEffect(() => {
    if (profile?.preferred_wpm && baseWpm !== profile.preferred_wpm) {
      // Debounce the WPM updates
      const saveTimer = setTimeout(() => {
        updatePreferredWpm(baseWpm);
        if (showToasts) {
          toast({
            title: "Reading Speed Saved",
            description: `Your preferred reading speed (${baseWpm} WPM) has been automatically saved.`,
          });
        }
      }, 1500); // Wait 1.5 seconds after last change
      
      return () => clearTimeout(saveTimer);
    }
  }, [baseWpm, profile?.preferred_wpm, updatePreferredWpm, toast, showToasts]);

  // Save position when user exits the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("Saving position before unload, WPM:", baseWpm);
      savePosition();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      savePosition();
    };
  }, [currentWordIndex, contentId, savePosition, baseWpm]);
  
  // Save position when reader is unmounted
  useEffect(() => {
    return () => {
      if (currentWordIndex > 0) {
        console.log("Saving position on unmount, WPM:", baseWpm);
        savePosition();
      }
    };
  }, [currentWordIndex, savePosition, baseWpm]);
  
  // Toggle notifications
  const toggleNotifications = () => {
    const newState = !showToastsState;
    setShowToastsState(newState);
    setShowToasts(newState);
  };
  
  // Handle manual save of position with current WPM
  const handleSavePosition = () => {
    console.log("Manually saving position with current WPM:", baseWpm);
    savePosition();
  };
  
  // Log progress for debugging
  useEffect(() => {
    console.log(`Current progress: ${progress}%, Word index: ${currentWordIndex}/${words.length}, Playing: ${isPlaying}, WPM: ${baseWpm}`);
  }, [progress, currentWordIndex, words.length, isPlaying, baseWpm]);
  
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
        />
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <button 
            className={`px-3 py-1 rounded-md flex items-center gap-1 ${
              showToastsState 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
            onClick={toggleNotifications}
          >
            {showToastsState ? "Notifications On" : "Notifications Off"}
          </button>
        </div>
        
        <SpeedControl 
          baseWpm={baseWpm}
          onWpmChange={handleWpmChange}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onSavePosition={handleSavePosition} // Pass the save function
        />
      </div>
    </div>
  );
};

export default RSVPReader;
