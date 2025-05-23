
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils";

// Calculate progress for an entry
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  // Use either explicit is_completed flag or calculate based on position
  if (entry.is_completed) {
    return 100;
  }
  
  // Calculate progress based on current position divided by total word count
  if (entry.parsed_text && entry.current_position) {
    const wordCount = entry.parsed_text.split(/\s+/).filter(word => word.length > 0).length;
    return Math.min(Math.round((entry.current_position / wordCount) * 100), 100);
  }
  
  return calculateProgressPercentage(
    entry.current_position || 0,
    entry.parsed_text
  );
};
