
import { ReadingHistoryEntry } from "@/hooks/useReadingHistory";

// Calculate the reading progress based on position and total words
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  if (!entry.current_position || entry.current_position <= 0) return 0;
  if (!entry.parsed_text) return 0;
  
  // Count words in parsed_text
  const words = entry.parsed_text.split(/\s+/).filter(word => word.length > 0);
  const totalWords = words.length;
  
  if (totalWords <= 0) return 0;
  
  const progress = Math.min(Math.round((entry.current_position / totalWords) * 100), 100);
  return progress;
};
