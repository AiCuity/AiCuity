import { useEffect, useCallback } from "react";
import { useRSVPCore } from "./rsvp/useRSVPCore";
import { usePlaybackControls } from "./rsvp/usePlaybackControls";
import { useHistoryTracker } from "./rsvp/useHistoryTracker";
import { useRSVPReadingPosition } from "./rsvp/useRSVPReadingPosition";
import { useSmartPacing } from "./rsvp/useSmartPacing";
import { useSpeedControl } from "./rsvp/useSpeedControl";
import { useWordFormatting } from "./rsvp/useWordFormatting";
import { RSVPReaderOptions, RSVPReaderHook } from "@/utils/rsvp-types";

export function useRSVPReader({
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true,
  initialPosition = 0,
  contentId
}: RSVPReaderOptions): RSVPReaderHook {
  // Log the initial WPM we're receiving
  console.log("useRSVPReader - Initial WPM type:", typeof initialWpm, "Value:", initialWpm);
  
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
  
  console.log("useRSVPReader - After core init - baseWpm:", baseWpm);
  
  // Get reading position controls
  const {
    goToNextWord,
    goToPreviousWord,
    restartReading
  } = useRSVPReadingPosition({
    words,
    currentWordIndex,
    setCurrentWordIndex,
    showToasts
  });
  
  // Get smart pacing controls
  const {
    toggleSmartPacing
  } = useSmartPacing({
    smartPacingEnabled,
    setSmartPacingEnabled,
    showToasts
  });
  
  // Get speed control
  const {
    handleWpmChange: baseHandleWpmChange
  } = useSpeedControl({
    setBaseWpm,
    showToasts
  });
  
  // Get word formatting utilities
  const {
    formattedWord,
    progress
  } = useWordFormatting({
    words,
    currentWordIndex
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
    baseWpm,
    text,
    showToasts
  );

  // Enhanced play/pause handler that really works
  const togglePlay = useCallback(() => {
    const newPlayState = !isPlaying;
    console.log("togglePlay - Setting play state to:", newPlayState, "Current WPM:", baseWpm);
    
    // Forcefully toggle the play state
    setIsPlaying(newPlayState);
    
    // Handle based on the new play state
    if (newPlayState) {
      // We're playing now
      console.log("Starting reading in togglePlay");
      // Will be handled by the effect below
    } else {
      // We're pausing - save position
      if (currentWordIndex > 0) {
        console.log("Saving position on pause with WPM:", baseWpm);
        savePosition();
      }
    }
  }, [isPlaying, setIsPlaying, currentWordIndex, savePosition, baseWpm]);

  // Handle play/pause with improved synchronization
  useEffect(() => {
    console.log("Play state changed:", isPlaying, "WPM:", baseWpm);
    
    if (isPlaying) {
      console.log("Starting reading due to isPlaying state change");
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      console.log("Cleaning up play/pause effect");
      stopReading();
    };
  }, [isPlaying, baseWpm, startReading, stopReading]);

  // Modified WPM change handler to ensure proper type and add auto-save
  const handleWpmChangeWithSave = useCallback((values: number[]) => {
    // Extract the numeric value from the array
    const newWpm = values[0];
    console.log("handleWpmChangeWithSave - Setting new WPM:", newWpm);
    console.log("handleWpmChangeWithSave - Previous WPM:", baseWpm);
    
    // Pass to original handler
    baseHandleWpmChange(values);
    
    // Add auto-save when WPM changes
    if (contentId && currentWordIndex > 0) {
      const wpmSaveTimer = setTimeout(() => {
        console.log("Auto-saving after WPM change:", newWpm);
        savePosition();
      }, 1500); // Wait 1.5 seconds after last WPM change to save
      
      return () => clearTimeout(wpmSaveTimer);
    }
  }, [baseHandleWpmChange, contentId, currentWordIndex, baseWpm, savePosition]);

  // Return combined hook interface with enhanced toggle functionality
  return {
    words,
    currentWordIndex,
    setCurrentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    effectiveWpm,
    currentComplexity,
    smartPacingEnabled,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange: handleWpmChangeWithSave,
    formattedWord,
    progress,
    restartReading,
    setShowToasts,
    showToasts,
    savePosition
  };
}
