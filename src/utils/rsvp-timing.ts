
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
