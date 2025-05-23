
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";

// Calculate progress for an entry with efficient caching
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  // Use either explicit is_completed flag or calculate based on position
  if (entry.is_completed) {
    return 100;
  }
  
  // If we have current position but no content, return a percentage based on typical article length
  if (entry.current_position && !entry.parsed_text) {
    // Fallback - estimate based on typical article length
    const estimatedTotalWords = 1000; // Average article length
    return Math.min(Math.round((entry.current_position / estimatedTotalWords) * 100), 100);
  }
  
  // If we don't have position data, return 0% progress
  if (!entry.current_position) {
    return 0;
  }
  
  // Use parsed_text if available to calculate accurate progress
  if (entry.parsed_text) {
    // Calculate progress based on current position and total text
    return calculateProgressPercentage(
      entry.current_position,
      entry.parsed_text
    );
  }
  
  // Default fallback
  return 0;
};
