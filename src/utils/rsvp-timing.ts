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

// Context-aware complexity smoothing
const recentComplexities: number[] = [];
const SMOOTHING_WINDOW_SIZE = 5; // Number of words to consider for smoothing

/**
 * Calculate the delay for a word based on its complexity
 * Now with smoothing for more gradual speed changes
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
    recentComplexities.length = 0; // Clear history when disabled
    return baseDelay;
  }
  
  // Add current complexity to recent history for smoothing
  recentComplexities.push(complexity);
  
  // Keep only the most recent entries based on window size
  if (recentComplexities.length > SMOOTHING_WINDOW_SIZE) {
    recentComplexities.shift(); // Remove oldest
  }
  
  // Calculate smoothed complexity using weighted average
  // More weight to current word but consider recent words too
  let smoothedComplexity = complexity; // Start with current complexity
  
  if (recentComplexities.length > 1) {
    // Weight recent complexities with decreasing importance
    const totalEntries = recentComplexities.length;
    let weightSum = 0;
    let weightedSum = 0;
    
    for (let i = 0; i < totalEntries; i++) {
      // More recent words have higher weight
      // Current word (last in array) has highest weight
      const weight = (i + 1) / totalEntries;
      weightSum += weight;
      weightedSum += recentComplexities[i] * weight;
    }
    
    // Compute weighted average
    smoothedComplexity = weightedSum / weightSum;
  }
  
  // Use the same algorithm from before, but with smoothed complexity
  // Maximum adjustment percentage (equal in both directions)
  const maxAdjustmentPercent = 0.5; // 50% slower or faster
  
  // Convert smoothed complexity (0-1) to adjustment factor (-0.5 to 0.5)
  // When complexity is 0.5 (medium), adjustment will be 0 (no change)
  // When complexity is 1.0 (max), adjustment will be +0.5 (slower)
  // When complexity is 0.0 (min), adjustment will be -0.5 (faster)
  const adjustmentFactor = (smoothedComplexity - 0.5) * maxAdjustmentPercent * 2;
  
  // Apply the adjustment to the base delay
  // Positive adjustment = longer delay = slower reading
  // Negative adjustment = shorter delay = faster reading
  const adjustedDelay = baseDelay * (1 + adjustmentFactor);
  
  return Math.round(adjustedDelay);
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
