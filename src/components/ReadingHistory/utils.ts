
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils";

// Calculate progress for an entry
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  // Use either explicit is_completed flag or calculate based on position
  if (entry.is_completed) {
    return 100;
  }
  
  return calculateProgressPercentage(
    entry.current_position || 0,
    entry.parsed_text
  );
};
