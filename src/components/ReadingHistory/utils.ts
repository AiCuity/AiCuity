
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

// Calculate progress for an entry
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  // Use either explicit is_completed flag or calculate based on position
  if (entry.is_completed) {
    return 100;
  }
  
  // Use parsed_text if available, otherwise estimate from position
  if (entry.parsed_text) {
    // Calculate progress based on current position and total text
    return calculateProgressPercentage(
      entry.current_position || 0,
      entry.parsed_text
    );
  }
  
  // Fallback if we don't have the full text - estimate based on typical article length
  // This is a rough estimate for entries that don't have parsed_text
  const estimatedTotalWords = 1000; // Average article length
  return Math.min(Math.round(((entry.current_position || 0) / estimatedTotalWords) * 100), 100);
};
