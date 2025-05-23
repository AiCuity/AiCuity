
import { useEffect, useCallback } from "react";
import { useRSVPCore } from "./rsvp/useRSVPCore";
import { useRSVPControls } from "./rsvp/useRSVPControls";
import { usePlaybackControls } from "./rsvp/usePlaybackControls";
import { useHistoryTracker } from "./rsvp/useHistoryTracker";
import { RSVPReaderOptions, RSVPReaderHook } from "@/utils/rsvp-types";

export function useRSVPReader({
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true,
  initialPosition = 0,
  contentId
}: RSVPReaderOptions): RSVPReaderHook {
  // Get core RSVP state
  const {
    words,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    setBaseWpm,
    effectiveWpm,
    setEffectiveWpm,
    currentComplexity,
    setCurrentComplexity,
    smartPacingEnabled,
    setSmartPacingEnabled,
    showToasts,
    setShowToasts
  } = useRSVPCore({
    text,
    initialWpm,
    initialSmartPacing,
    initialShowToasts,
    initialPosition
  });
  
  // Get RSVP controls
  const {
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading
  } = useRSVPControls({
    words,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    setBaseWpm,
    smartPacingEnabled,
    setSmartPacingEnabled,
    showToasts
  });
  
  // Get playback controls
  const [playbackRefs, { 
    startReading, stopReading, updateReading 
  }] = usePlaybackControls(
    words,
    baseWpm,
    smartPacingEnabled,
    showToasts,
    setCurrentWordIndex,
    setIsPlaying,
    setEffectiveWpm,
    setCurrentComplexity
  );
  
  // Get history tracking functionality
  const { savePosition } = useHistoryTracker(
    contentId,
    currentWordIndex,
    isPlaying,
    baseWpm, // Pass the current baseWpm to history tracker
    text,
    showToasts
  );

  // Enhanced play/pause handler
  const togglePlay = useCallback(() => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    
    // Save position when toggling play/pause
    if (!newPlayState && currentWordIndex > 0) {
      // Only save when pausing and we've read some content
      savePosition();
    }
  }, [isPlaying, setIsPlaying, currentWordIndex, savePosition]);

  // Handle play/pause with improved synchronization
  useEffect(() => {
    console.log("Play state changed:", isPlaying, "WPM:", baseWpm);
    
    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      stopReading();
    };
  }, [isPlaying, baseWpm, currentWordIndex, smartPacingEnabled, startReading, stopReading]);

  // Add auto-save when WPM changes
  useEffect(() => {
    // Debounce WPM changes to avoid excessive saving
    if (contentId && currentWordIndex > 0) {
      const wpmSaveTimer = setTimeout(() => {
        console.log("Auto-saving after WPM change:", baseWpm);
        savePosition();
      }, 1500); // Wait 1.5 seconds after last WPM change to save
      
      return () => clearTimeout(wpmSaveTimer);
    }
  }, [baseWpm, contentId, currentWordIndex, savePosition]);

  // Return combined hook interface with enhanced toggle functionality
  return {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying: togglePlay, // Use the enhanced toggle function
    baseWpm,
    effectiveWpm,
    currentComplexity,
    smartPacingEnabled,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading,
    setShowToasts,
    showToasts,
    savePosition
  };
}
