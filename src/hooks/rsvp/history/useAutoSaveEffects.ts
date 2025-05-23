
import { useEffect } from "react";
import { hasSignificantPositionChange, hasEnoughTimePassed } from "@/hooks/readingHistory/utils/sessionUtils";

/**
 * Hook to handle various auto-save effects based on user interactions
 */
export function useAutoSaveEffects(
  contentId: string | undefined,
  isPlaying: boolean,
  currentWordIndex: number,
  progressPercentage: number,
  baseWpm: number,
  localEntrySaved: React.MutableRefObject<boolean>,
  lastSavedPosition: React.MutableRefObject<number>,
  lastSavedTime: React.MutableRefObject<number>,
  savePosition: () => Promise<boolean>
) {
  // Minimum position change before saving again (to avoid excessive saves)
  const MIN_POSITION_CHANGE = 20;
  // Minimum time between auto-saves in milliseconds
  const MIN_SAVE_INTERVAL = 30000; // 30 seconds

  // Save to Supabase ONLY when user pauses after a meaningful reading session
  useEffect(() => {
    if (!isPlaying && localEntrySaved.current && contentId && currentWordIndex > 5) {
      // Only save if there's been a significant change in position
      if (hasSignificantPositionChange(currentWordIndex, lastSavedPosition.current, MIN_POSITION_CHANGE)) {
        const debounceTimer = setTimeout(() => {
          console.log("Saving to Supabase after pause: position", currentWordIndex, "progress:", progressPercentage + "%");
          savePosition();
        }, 2000); // Save 2 seconds after stopping
        
        return () => clearTimeout(debounceTimer);
      }
    }
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition, lastSavedPosition, localEntrySaved]);
  
  // Auto-save periodically while reading, but only if enough time has passed and position changed
  useEffect(() => {
    let saveInterval: NodeJS.Timeout;
    
    if (isPlaying && contentId && currentWordIndex > 0) {
      saveInterval = setInterval(() => {
        // Only save if both time and position conditions are met
        if (hasEnoughTimePassed(lastSavedTime.current, MIN_SAVE_INTERVAL) && 
            hasSignificantPositionChange(currentWordIndex, lastSavedPosition.current, MIN_POSITION_CHANGE)) {
          console.log("Auto-saving position during reading - significant progress made:", 
                      currentWordIndex, "progress:", progressPercentage + "%", "WPM:", baseWpm);
          savePosition();
        }
      }, MIN_SAVE_INTERVAL); // Check every 30 seconds
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition, lastSavedPosition, lastSavedTime]);

  return {};
}
