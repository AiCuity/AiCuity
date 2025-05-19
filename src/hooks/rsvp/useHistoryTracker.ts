
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  
  // Calculate total words for progress percentage
  const totalWords = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
  const progressPercentage = totalWords > 0 ? Math.round((currentWordIndex / totalWords) * 100) : 0;

  // Save current position to history
  const savePosition = async () => {
    if (!contentId || !isSignificantSession) {
      return false;
    }
    
    try {
      await saveHistoryEntry({
        content_id: contentId,
        title: "Reading Session", // This should be replaced with actual title if available
        source: null,
        source_type: "unknown",
        source_input: "",
        current_position: currentWordIndex,
        wpm: baseWpm,
        calibrated: false,
        summary: null,
        parsed_text: text,
      });
      
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

  // Auto-save position when user stops reading, but only if it's a significant session
  useEffect(() => {
    // Only attempt to save if the user is logged in and it's a significant session
    if (!isPlaying && isSignificantSession && contentId && user) {
      const debounceTimer = setTimeout(() => {
        savePosition();
      }, 3000); // Save 3 seconds after stopping
      
      return () => clearTimeout(debounceTimer);
    }
  }, [isPlaying, contentId, currentWordIndex, user, isSignificantSession]);

  return { savePosition };
}
