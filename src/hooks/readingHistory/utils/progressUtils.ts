
/**
 * Calculates reading progress percentage
 */
export const calculateProgressPercentage = (currentPosition: number, totalText: string | null): number => {
  if (!totalText) return 0;
  
  const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
  return totalWords > 0 
    ? Math.min(Math.round((currentPosition / totalWords) * 100), 100)
    : 0;
};
