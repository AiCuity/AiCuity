
/**
 * Calculates reading progress percentage
 */
export const calculateProgressPercentage = (currentPosition: number, totalText: string | null): number => {
  if (!totalText) return 0;
  
  const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
  
  if (totalWords === 0) return 0;
  
  // Calculate percentage and ensure it's between 0-100
  const percentage = Math.min(Math.round((currentPosition / totalWords) * 100), 100);
  return percentage;
};
