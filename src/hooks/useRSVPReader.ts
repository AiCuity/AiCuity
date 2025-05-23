
import { useEffect } from "react";
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
    baseWpm,
    text,
    showToasts
  );

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      stopReading();
    };
  }, [isPlaying, baseWpm, currentWordIndex, smartPacingEnabled, startReading, stopReading]);

  // Return combined hook interface
  return {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying,
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
