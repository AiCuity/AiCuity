
/**
 * Calculate progress percentage based on current position and total words
 */
export const calculateProgressPercentage = (currentPosition: number | string, totalWords: number | string): number => {
  // Ensure both inputs are numbers
  const position = typeof currentPosition === 'string' ? parseInt(currentPosition, 10) : currentPosition;
  const total = typeof totalWords === 'string' ? parseInt(totalWords, 10) : totalWords;
  
  if (isNaN(position) || isNaN(total) || total === 0) return 0;
  return Math.min(Math.round((position / total) * 100), 100);
};
