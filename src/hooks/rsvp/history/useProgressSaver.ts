
import { useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

export function useProgressSaver(
  contentId: string | undefined,
  currentWordIndex: number,
  baseWpm: number,
  text: string,
  showToasts: boolean
) {
  const { toast } = useToast();
  const { saveHistoryEntry, history, findExistingEntryBySource } = useReadingHistory();
  const lastSavedPosition = useRef<number>(0);
  const lastSavedTime = useRef<number>(Date.now());
  
  // Calculate progress percentage
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const progressPercentage = calculateProgressPercentage(currentWordIndex, totalWords);

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
    
    // Check if the current reading session is significant enough to save
    const MIN_WORDS_READ = 5;
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
      if (!partialEntry.summary && partialEntry.title === "Reading Session" && partialEntry.current_position < 20) {
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
        calibrated: false,
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
  }, [contentId, currentWordIndex, baseWpm, totalWords, progressPercentage, history, text, saveHistoryEntry, findExistingEntryBySource, showToasts, toast]);

  return {
    savePosition,
    progressPercentage,
    totalWords,
    lastSavedPosition,
    lastSavedTime
  };
}
