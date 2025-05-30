import { ReadingHistoryEntry } from '../types';

/**
 * Calculate total words from content text
 */
export const calculateTotalWords = (content: string | null): number => {
  if (!content || typeof content !== 'string') return 0;
  
  return content
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
};

/**
 * Calculate progress percentage based on current position and total words (backward compatibility)
 */
export const calculateProgressPercentage = (currentPosition: number | string, totalWords: number | string): number => {
  // Ensure both inputs are numbers
  const position = typeof currentPosition === 'string' ? parseInt(currentPosition, 10) : currentPosition;
  const total = typeof totalWords === 'string' ? parseInt(totalWords, 10) : totalWords;
  
  if (isNaN(position) || isNaN(total) || total === 0) return 0;
  return Math.min(Math.round((position / total) * 100), 100);
};

/**
 * Calculate reading progress as a percentage
 */
export const calculateProgress = (entry: ReadingHistoryEntry): number => {
  const currentPosition = entry.current_position || 0;
  
  // Use saved total_words if available for better performance and consistency
  if (entry.total_words && entry.total_words > 0) {
    return Math.min(Math.round((currentPosition / entry.total_words) * 100), 100);
  }
  
  // Fallback to calculating from parsed_text if total_words is not available
  if (entry.parsed_text) {
    const totalWords = calculateTotalWords(entry.parsed_text);
    if (totalWords > 0) {
      return Math.min(Math.round((currentPosition / totalWords) * 100), 100);
    }
  }
  
  return 0;
};
