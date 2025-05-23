
/**
 * Calculates reading progress percentage
 */
export const calculateProgressPercentage = (currentPosition: number, totalText: string | number | null): number => {
  if (totalText === null || totalText === undefined) return 0;
  
  // If totalText is a number, assume it's the total word count
  if (typeof totalText === 'number') {
    if (totalText === 0) return 0;
    // Calculate percentage and ensure it's between 0-100
    return Math.min(Math.round((currentPosition / totalText) * 100), 100);
  }
  
  // If totalText is a string, calculate based on word count
  if (typeof totalText === 'string') {
    const totalWords = totalText.split(/\s+/).filter(word => word.length > 0).length;
    
    if (totalWords === 0) return 0;
    
    // Calculate percentage and ensure it's between 0-100
    return Math.min(Math.round((currentPosition / totalWords) * 100), 100);
  }
  
  return 0;
};
