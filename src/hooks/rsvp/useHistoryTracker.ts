
import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useInitialDataFetch } from "./history/useInitialDataFetch";
import { useProgressSaver } from "./history/useProgressSaver";
import { useLocalHistoryStorage } from "./history/useLocalHistoryStorage";
import { useAutoSaveEffects } from "./history/useAutoSaveEffects";

export function useHistoryTracker(
  contentId: string | undefined,
  currentWordIndex: number,
  isPlaying: boolean,
  baseWpm: number,
  text: string,
  showToasts: boolean
): { savePosition: () => Promise<boolean> } {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Initialize data fetching
  useInitialDataFetch();
  
  // Set up progress saving functionality
  const { 
    savePosition, 
    progressPercentage,
    totalWords,
    lastSavedPosition,
    lastSavedTime
  } = useProgressSaver(
    contentId,
    currentWordIndex,
    baseWpm,
    text,
    showToasts
  );
  
  // Set up local storage history tracking
  const { localEntrySaved } = useLocalHistoryStorage(
    contentId,
    currentWordIndex,
    baseWpm,
    progressPercentage,
    lastSavedPosition
  );
  
  // Set up auto-save effects
  useAutoSaveEffects(
    contentId,
    isPlaying,
    currentWordIndex,
    progressPercentage,
    baseWpm,
    localEntrySaved,
    lastSavedPosition,
    lastSavedTime,
    savePosition
  );

  return { savePosition };
}
