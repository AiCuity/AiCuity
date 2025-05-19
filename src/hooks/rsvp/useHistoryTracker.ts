
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useAuth } from "@/context/AuthContext";

export function useHistoryTracker(
  contentId: string | undefined,
  currentWordIndex: number,
  isPlaying: boolean,
  baseWpm: number,
  text: string,
  showToasts: boolean
): { savePosition: () => Promise<boolean> } {
  const { toast } = useToast();
  const { saveHistoryEntry, history, fetchHistory } = useReadingHistory();
  const { user } = useAuth(); // Get the current authenticated user

  // Minimum progress required to consider a session worth saving
  const MIN_WORDS_READ = 20;
  
  // Check if this is a significant reading session
  const isSignificantSession = currentWordIndex >= MIN_WORDS_READ;
  
  // Calculate progress percentage
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  const progressPercentage = totalWords > 0 
    ? Math.min(Math.round((currentWordIndex / totalWords) * 100), 100)
    : 0;

  // Refresh history when component mounts
  useEffect(() => {
    fetchHistory();
  }, []);

  // Save current position to history
  const savePosition = async () => {
    // Don't save if we don't have a valid contentId
    if (!contentId) {
      console.log("Not saving position - missing contentId");
      return false;
    }
    
    try {
      // Check if there's already an entry for this content to avoid duplicates
      const existingEntry = history.find(entry => entry.content_id === contentId);
      
      // Only save if it's a significant session or if it already has a summary
      if (!isSignificantSession && !existingEntry?.summary) {
        console.log("Not saving insignificant session with no summary");
        return false;
      }
      
      console.log(`Saving reading progress for ${contentId}: ${currentWordIndex}/${totalWords} (${progressPercentage}%)`);
      
      // Prepare the entry data
      const entryData = {
        content_id: contentId,
        title: existingEntry?.title || "Reading Session", // Use existing title if available
        source: existingEntry?.source || null,
        source_type: existingEntry?.source_type || "unknown",
        source_input: existingEntry?.source_input || "",
        current_position: currentWordIndex,
        wpm: baseWpm,
        calibrated: false,
        summary: existingEntry?.summary || null,
        parsed_text: text,
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
  }, [isPlaying, contentId, currentWordIndex]);
  
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
