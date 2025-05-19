
/**
 * Calculate milliseconds per word based on words per minute
 */
export function calculateMsPerWord(wpm: number): number {
  return 60000 / wpm;
}

/**
 * Check if enough time has passed to show the next word
 */
export function shouldAdvanceWord(
  currentTimestamp: number, 
  lastUpdateTime: number, 
  msPerWord: number
): boolean {
  const timePassed = currentTimestamp - lastUpdateTime;
  return timePassed >= msPerWord;
}

/**
 * Calculate the delay for a word based on its complexity
 * @param baseWpm The base reading speed in words per minute
 * @param complexity The complexity factor (0-1) of the current word
 * @param smartPacingEnabled Whether smart pacing is enabled
 * @returns The delay in milliseconds for the word
 */
export function calculateDelay(
  baseWpm: number, 
  complexity: number, 
  smartPacingEnabled: boolean
): number {
  // Base delay in milliseconds
  const baseDelay = calculateMsPerWord(baseWpm);
  
  // If smart pacing is disabled, return the base delay
  if (!smartPacingEnabled) {
    return baseDelay;
  }
  
  // Apply complexity-based adjustment
  // Higher complexity = longer delay (slower reading)
  const adjustmentFactor = 1 + (complexity * 1.5); // Max 2.5x slower for very complex words
  
  return Math.round(baseDelay * adjustmentFactor);
}

/**
 * Calculate complexity of a word (0-1)
 * This is a simple implementation that can be made more sophisticated later
 * @param word The word to analyze
 * @returns A complexity score between 0 and 1
 */
export function calculateComplexity(word: string): number {
  if (!word) return 0;
  
  // Get the base complexity from the textAnalysis utility
  // Import from textAnalysis to avoid circular dependencies
  const { calculateComplexity: getTextComplexity } = require("../utils/textAnalysis");
  return getTextComplexity(word);
}
