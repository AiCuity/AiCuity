
import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

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

  // Minimum progress required to consider a session worth saving
  const MIN_WORDS_READ = 5;
  
  // Check if this is a significant reading session
  const isSignificantSession = currentWordIndex >= MIN_WORDS_READ;
  
  // Calculate progress percentage
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const progressPercentage = calculateProgressPercentage(currentWordIndex, totalWords);

  // Refresh history when component mounts
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Save current position to history
  const savePosition = useCallback(async () => {
    // Ensure WPM is a number, not an array
    const wpmToSave = typeof baseWpm === 'number' ? baseWpm : 
                     Array.isArray(baseWpm) ? baseWpm[0] : 300;
    
    console.log("savePosition - WPM value type:", typeof baseWpm, "Value:", baseWpm);
    console.log("savePosition - WPM to save:", wpmToSave);
    
    // Don't save if we don't have a valid contentId
    if (!contentId) {
      console.log("Not saving position - missing contentId");
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
      
      // Only save if it's a significant session or if it already has a summary
      if (!isSignificantSession && !existingEntry?.summary) {
        console.log("Not saving insignificant session with no summary");
        return false;
      }
      
      console.log(`Saving reading progress for ${contentId}: ${currentWordIndex}/${totalWords} (${progressPercentage}%) at ${wpmToSave} WPM`);
      
      // Get title from session storage or use the existing title
      const title = sessionStorage.getItem('contentTitle') || existingEntry?.title || "Reading Session";
      
      // Calculate if the reading is completed (reached end or close to end)
      const isCompleted = currentWordIndex >= totalWords - 5;
      
      // Prepare the entry data
      const entryData = {
        content_id: contentId,
        title: title,
        source: sourceUrl || existingEntry?.source || null,
        source_type: existingEntry?.source_type || "unknown",
        source_input: existingEntry?.source_input || sourceUrl || "",
        current_position: currentWordIndex,
        wpm: wpmToSave, // Use the number value, not an array
        calibrated: profile?.calibration_status === 'completed' || false,
        summary: existingEntry?.summary || null,
        parsed_text: text,
        is_completed: isCompleted
      };
      
      await saveHistoryEntry(entryData);
      
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
  }, [contentId, currentWordIndex, baseWpm, totalWords, progressPercentage, history, isSignificantSession, profile, text, saveHistoryEntry, findExistingEntryBySource, showToasts, toast]);

  // Auto-save position when user stops reading
  useEffect(() => {
    if (!isPlaying && contentId && currentWordIndex > 0) {
      const debounceTimer = setTimeout(() => {
        console.log("Auto-saving position after stopping:", currentWordIndex, "progress:", progressPercentage + "%", "WPM:", baseWpm);
        savePosition();
      }, 2000); // Save 2 seconds after stopping
      
      return () => clearTimeout(debounceTimer);
    }
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition]);
  
  // Auto-save position when user changes play status (start/stop reading)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (contentId && currentWordIndex > 0) {
        console.log("Auto-saving position on play status change:", currentWordIndex, "progress:", progressPercentage + "%", "WPM:", baseWpm);
        savePosition();
      }
    }, 500);
    
    return () => clearTimeout(saveTimer);
  }, [isPlaying, savePosition, contentId, currentWordIndex, progressPercentage, baseWpm]);
  
  // Auto-save periodically while reading (every 30 seconds)
  useEffect(() => {
    let saveInterval: NodeJS.Timeout;
    
    if (isPlaying && contentId && currentWordIndex > 0) {
      saveInterval = setInterval(() => {
        console.log("Auto-saving position during reading:", currentWordIndex, "progress:", progressPercentage + "%", "WPM:", baseWpm);
        savePosition();
      }, 30000); // Save every 30 seconds while reading
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isPlaying, contentId, currentWordIndex, progressPercentage, baseWpm, savePosition]);

  return { savePosition };
}
