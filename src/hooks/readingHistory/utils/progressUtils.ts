
/**
 * Calculate progress percentage based on current position and total words
 */
export const calculateProgressPercentage = (currentPosition: number, totalWords: number): number => {
  if (totalWords === 0) return 0;
  return Math.min(Math.round((currentPosition / totalWords) * 100), 100);
};
