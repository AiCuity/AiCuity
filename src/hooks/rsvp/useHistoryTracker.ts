
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";
import { 
  isSignificantSession, 
  hasSignificantPositionChange, 
  hasEnoughTimePassed 
} from "@/hooks/readingHistory/utils/sessionUtils";

export function useHistoryTracker(
  contentId: string | undefined,
  currentWordIndex: number,
  isPlaying: boolean,
  baseWpm: number,
  text: string,
  showToasts: boolean
): { savePosition: () => Promise<boolean> } {
  const { toast } = useToast();
  const { saveHistoryEntry, history, fetchHistory, findExistingEntryBySource } = useReadingHistory();
  const { user } = useAuth();
  const { profile } = useProfile();
  const lastSavedPosition = useRef<number>(0);
  const lastSavedTime = useRef<number>(Date.now());
  const localEntrySaved = useRef<boolean>(false);
  
  // Minimum progress required to consider a session worth saving
  const MIN_WORDS_READ = 5;
  // Minimum position change before saving again (to avoid excessive saves)
  const MIN_POSITION_CHANGE = 20;
  // Minimum time between auto-saves in milliseconds
  const MIN_SAVE_INTERVAL = 30000; // 30 seconds
  
  // Calculate progress percentage
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const progressPercentage = calculateProgressPercentage(currentWordIndex, totalWords);

  // Refresh history when component mounts
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  // Save to localStorage whenever position changes
  useEffect(() => {
    // Don't save if we don't have a valid contentId
    if (!contentId || currentWordIndex < MIN_WORDS_READ) {
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
      console.log(`Saved reading position to localStorage: ${currentWordIndex}/${totalWords} (${progressPercentage}%)`);
    }
  }, [contentId, currentWordIndex, baseWpm, totalWords, progressPercentage]);

  // Save current position to history
  const savePosition = useCallback(async () => {
    // Ensure WPM is a number, not an array
    const wpmToSave = typeof baseWpm === 'number' ? baseWpm : 
                     Array.isArray(baseWpm) ? baseWpm[0] : 300;
    
    // Don't save if we don't have a valid contentId
    if (!contentId) {
      console.log("Not saving position - missing contentId");
      return false;
    }
    
    // Don't save if position hasn't changed significantly
    if (currentWordIndex === lastSavedPosition.current) {
      console.log("Not saving position - no change since last save");
      return false;
    }
    
    // Check if the current reading session is significant enough to save to Supabase
    if (currentWordIndex < MIN_WORDS_READ) {
      console.log("Not saving position - not enough words read");
      return false;
    }
    
    // Get source URL from session storage if available
    const sourceUrl = sessionStorage.getItem('contentSource');
    
    try {
      // First try to find by content ID
      let existingEntry = history.find(entry => entry.content_id === contentId);
      
      // If not found by content ID and we have a source URL,
      // try to find by source URL
      if (!existingEntry && sourceUrl) {
        existingEntry = findExistingEntryBySource(sourceUrl);
      }
      
      // Prepare partial entry for significance check
      const partialEntry = {
        title: sessionStorage.getItem('contentTitle') || existingEntry?.title || "Reading Session",
        summary: existingEntry?.summary || null,
        current_position: currentWordIndex
      };
      
      // Only save if it's a significant session
      if (!isSignificantSession(partialEntry) && !existingEntry?.summary) {
        console.log("Not saving insignificant session with no summary");
        return false;
      }
      
      console.log(`Saving reading progress for ${contentId}: ${currentWordIndex}/${totalWords} (${progressPercentage}%) at ${wpmToSave} WPM`);
      
      // Calculate if the reading is completed (reached end or close to end)
      const isCompleted = currentWordIndex >= totalWords - 5;
      
      // Prepare the entry data
      const entryData = {
        content_id: contentId,
        title: partialEntry.title,
        source: sourceUrl || existingEntry?.source || null,
        source_type: existingEntry?.source_type || "unknown",
        source_input: existingEntry?.source_input || sourceUrl || "",
        current_position: currentWordIndex,
        wpm: wpmToSave,
        calibrated: profile?.calibration_status === 'completed' || false,
        summary: existingEntry?.summary || null,
        parsed_text: text,
        is_completed: isCompleted
      };
      
      await saveHistoryEntry(entryData);
      
      // Update our reference values after successful save
      lastSavedPosition.current = currentWordIndex;
      lastSavedTime.current = Date.now();
      
      if (showToasts) {
        toast({
          title: "Progress Saved",
          description: `Your reading position (${progressPercentage}%) has been saved at ${wpmToSave} WPM.`,
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error saving position:", error);
      if (showToasts) {
        toast({
          title: "Error Saving Progress",
          description: "Failed to save your reading position.",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [contentId, currentWordIndex, baseWpm, totalWords, progressPercentage, history, profile, text, saveHistoryEntry, findExistingEntryBySource, showToasts, toast]);

  // Save to Supabase ONLY when user pauses after a meaningful reading session
  useEffect(() => {
    if (!isPlaying && localEntrySaved.current && contentId && currentWordIndex > MIN_WORDS_READ) {
      // Only save if there's been a significant change in position
      if (hasSignificantPositionChange(currentWordIndex, lastSavedPosition.current, MIN_POSITION_CHANGE)) {
        const debounceTimer = setTimeout(() => {
          console.log("Saving to Supabase after pause: position", currentWordIndex, "progress:", progressPercentage + "%");
          savePosition();
        }, 2000); // Save 2 seconds after stopping
        
        return () => clearTimeout(debounceTimer);
      }
    }
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition]);
  
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
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition]);

  return { savePosition };
}
