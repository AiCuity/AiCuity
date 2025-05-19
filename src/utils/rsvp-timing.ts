
import { calculateComplexity as getTextComplexity } from "./textAnalysis";

/**
 * Calculate milliseconds per word based on words per minute
 * This is now memoized for better performance
 */
const wpmToMsCache = new Map<number, number>();
export function calculateMsPerWord(wpm: number): number {
  if (wpmToMsCache.has(wpm)) {
    return wpmToMsCache.get(wpm)!;
  }
  
  const result = 60000 / wpm;
  wpmToMsCache.set(wpm, result);
  return result;
}

/**
 * Check if enough time has passed to show the next word
 */
export function shouldAdvanceWord(
  currentTimestamp: number, 
  lastUpdateTime: number, 
  msPerWord: number
): boolean {
  // Quick path for obvious cases to improve performance
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
  // Base delay in milliseconds - use cached calculation
  const baseDelay = calculateMsPerWord(baseWpm);
  
  // If smart pacing is disabled, return the base delay
  if (!smartPacingEnabled) {
    return baseDelay;
  }
  
  // Apply complexity-based adjustment - optimize calculation
  // Higher complexity = longer delay (slower reading)
  // Use a simplified adjustment for calibration scenarios
  const adjustmentFactor = 1 + (complexity * Math.max(0.2, 1.2 - (baseWpm / 1200)));
  
  return Math.round(baseDelay * adjustmentFactor);
}

// Complexity cache for repeated words
const complexityCache = new Map<string, number>();

/**
 * Calculate complexity of a word (0-1)
 * This is a simple implementation that can be made more sophisticated later
 * Now with caching for better performance
 * @param word The word to analyze
 * @returns A complexity score between 0 and 1
 */
export function calculateComplexity(word: string): number {
  if (!word) return 0;
  
  // Check cache first for better performance
  if (complexityCache.has(word)) {
    return complexityCache.get(word)!;
  }
  
  // Use the imported function directly
  const complexity = getTextComplexity(word);
  
  // Store in cache
  complexityCache.set(word, complexity);
  
  return complexity;
}
