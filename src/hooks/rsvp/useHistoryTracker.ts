
import { useEffect } from "react";
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
  const savePosition = async () => {
    // Don't save if we don't have a valid contentId
    if (!contentId) {
      console.log("Not saving position - missing contentId");
      return false;
    }
    
    // Get source URL from session storage if available
    const source = sessionStorage.getItem('contentSource');
    
    try {
      // First try to find by content ID
      let existingEntry = history.find(entry => entry.content_id === contentId);
      
      // If not found by content ID and we have a source URL,
      // try to find by source URL
      if (!existingEntry && source) {
        existingEntry = findExistingEntryBySource(source);
      }
      
      // Only save if it's a significant session or if it already has a summary
      if (!isSignificantSession && !existingEntry?.summary) {
        console.log("Not saving insignificant session with no summary");
        return false;
      }
      
      console.log(`Saving reading progress for ${contentId}: ${currentWordIndex}/${totalWords} (${progressPercentage}%)`);
      
      // Get title from session storage or use the existing title
      const title = sessionStorage.getItem('contentTitle') || existingEntry?.title || "Reading Session";
      
      // Use preferred WPM from profile if available
      const wpm = profile?.preferred_wpm || baseWpm;
      
      // Calculate if the reading is completed (reached end or close to end)
      const isCompleted = currentWordIndex >= totalWords - 5;
      
      // Prepare the entry data
      const entryData = {
        content_id: contentId,
        title: title,
        source: source || existingEntry?.source || null,
        source_type: existingEntry?.source_type || "unknown",
        source_input: existingEntry?.source_input || source || "",
        current_position: currentWordIndex,
        wpm: wpm,
        calibrated: profile?.calibration_status === 'completed' || false,
        summary: existingEntry?.summary || null,
        parsed_text: text,
        is_completed: isCompleted
      };
      
      await saveHistoryEntry(entryData);
      
      if (showToasts) {
        toast({
          title: "Progress Saved",
          description: `Your reading position (${progressPercentage}%) has been saved.`,
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
  };

  // Auto-save position when user stops reading
  useEffect(() => {
    if (!isPlaying && contentId && currentWordIndex > 0) {
      const debounceTimer = setTimeout(() => {
        console.log("Auto-saving position after stopping:", currentWordIndex, "progress:", progressPercentage + "%");
        savePosition();
      }, 3000); // Save 3 seconds after stopping
      
      return () => clearTimeout(debounceTimer);
    }
  }, [isPlaying, contentId, currentWordIndex, progressPercentage]);
  
  // Auto-save position when user changes play status (start/stop reading)
  useEffect(() => {
    if (contentId && currentWordIndex > 0) {
      console.log("Auto-saving position on play status change:", currentWordIndex, "progress:", progressPercentage + "%");
      savePosition();
    }
  }, [isPlaying]);
  
  // Auto-save periodically while reading (every 30 seconds)
  useEffect(() => {
    let saveInterval: NodeJS.Timeout;
    
    if (isPlaying && contentId && currentWordIndex > 0) {
      saveInterval = setInterval(() => {
        console.log("Auto-saving position during reading:", currentWordIndex, "progress:", progressPercentage + "%");
        savePosition();
      }, 30000); // Save every 30 seconds while reading
    }
    
    return () => {
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [isPlaying, contentId, currentWordIndex, progressPercentage]);

  return { savePosition };
}
