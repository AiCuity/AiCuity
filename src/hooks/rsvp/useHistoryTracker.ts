
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReadingHistory } from "@/hooks/useReadingHistory";

export function useHistoryTracker(
  contentId: string | undefined,
  currentWordIndex: number,
  isPlaying: boolean,
  baseWpm: number,
  text: string,
  showToasts: boolean
): { savePosition: () => Promise<boolean> } {
  const { toast } = useToast();
  const { saveHistoryEntry } = useReadingHistory();

  // Save current position to history
  const savePosition = async () => {
    if (contentId) {
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
            description: "Your reading position has been saved.",
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
    }
    return false;
  };

  // Auto-save position when user stops reading
  useEffect(() => {
    // If user was reading but stopped, save position
    if (!isPlaying && currentWordIndex > 0 && contentId) {
      const debounceTimer = setTimeout(() => {
        savePosition();
      }, 3000); // Save 3 seconds after stopping
      
      return () => clearTimeout(debounceTimer);
    }
  }, [isPlaying, contentId, currentWordIndex]);

  return { savePosition };
}
