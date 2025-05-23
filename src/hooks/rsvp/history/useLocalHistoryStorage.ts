
import { useEffect, useRef } from "react";
import { hasSignificantPositionChange } from "@/hooks/readingHistory/utils/sessionUtils";

/**
 * Hook to manage local storage for reading history
 */
export function useLocalHistoryStorage(
  contentId: string | undefined,
  currentWordIndex: number,
  baseWpm: number,
  progressPercentage: number,
  lastSavedPosition: React.MutableRefObject<number>
) {
  const localEntrySaved = useRef<boolean>(false);
  
  // Save to localStorage whenever position changes
  useEffect(() => {
    // Don't save if we don't have a valid contentId
    if (!contentId || currentWordIndex < 5) {
      return;
    }
    
    // Don't save if position hasn't changed significantly
    if (currentWordIndex === lastSavedPosition.current) {
      return;
    }
    
    // Only save to localStorage if the change is significant enough
    if (hasSignificantPositionChange(currentWordIndex, lastSavedPosition.current, 5)) {
      // Save to localStorage
      const localReadingData = {
        contentId,
        position: currentWordIndex,
        wpm: baseWpm,
        timestamp: Date.now(),
        progress: progressPercentage,
        title: sessionStorage.getItem('contentTitle') || "Reading Session",
        source: sessionStorage.getItem('contentSource') || null
      };
      
      localStorage.setItem(`reading-${contentId}`, JSON.stringify(localReadingData));
      localEntrySaved.current = true;
      console.log(`Saved reading position to localStorage: ${currentWordIndex} (${progressPercentage}%)`);
    }
  }, [contentId, currentWordIndex, baseWpm, progressPercentage, lastSavedPosition]);

  return {
    localEntrySaved
  };
}
