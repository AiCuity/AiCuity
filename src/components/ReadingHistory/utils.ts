
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

// Calculate progress for an entry
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  // Use either explicit is_completed flag or calculate based on position
  if (entry.is_completed) {
    return 100;
  }
  
  // Calculate progress based on current position divided by total word count
  return calculateProgressPercentage(
    entry.current_position || 0,
    entry.parsed_text
  );
};
