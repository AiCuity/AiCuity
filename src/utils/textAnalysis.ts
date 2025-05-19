
// Simple scoring for text complexity
export const calculateComplexity = (word: string): number => {
  // Factor 1: Word length (longer words are generally more complex)
  const lengthFactor = Math.max(0, (word.length - 4) / 10);
  
  // Factor 2: Common punctuation that might require slowing down
  const punctuationFactor = /[,.;:?!()]/.test(word) ? 0.2 : 0;
  
  // Factor 3: Rare characters/symbols that might indicate complex words
  const symbolsFactor = /[@#$%^&*_+=\\|<>{}[\]~`]/.test(word) ? 0.3 : 0;
  
  // Factor 4: Capital letters (proper nouns, acronyms) might need more attention
  const capitalizationFactor = /[A-Z]/.test(word) && word.length > 1 ? 0.15 : 0;
  
  // Factor 5: Numbers might need more processing time
  const numberFactor = /\d/.test(word) ? 0.15 : 0;
  
  // Sum all factors, max complexity score is 1.0
  return Math.min(1.0, lengthFactor + punctuationFactor + symbolsFactor + capitalizationFactor + numberFactor);
};

// Determine if a word indicates the start of a new sentence or thought
export const isNewSentenceStart = (word: string, previousWord: string | null): boolean => {
  // If previous word ended with terminal punctuation
  if (previousWord && /[.!?]$/.test(previousWord)) {
    return true;
  }
  
  // If current word starts with a capital letter and isn't the first word
  if (previousWord && /^[A-Z]/.test(word) && word.length > 1) {
    return true;
  }
  
  return false;
};

// Calculate slowdown factor for a word
export const getSpeedAdjustmentFactor = (
  word: string, 
  previousWord: string | null, 
  baseWpm: number
): number => {
  const complexity = calculateComplexity(word);
  
  // Apply additional slowdown for the start of new sentences
  const sentenceStartFactor = isNewSentenceStart(word, previousWord) ? 0.3 : 0;
  
  // Calculate final slowdown factor (0 = no slowdown, 1 = max slowdown)
  const slowdownFactor = complexity + sentenceStartFactor;
  
  // Convert slowdown factor to a speed adjustment multiplier (between 0.4 and 1.0)
  // Higher complexity = lower multiplier = slower speed
  const speedMultiplier = 1 - (slowdownFactor * 0.6);
  
  return Math.max(0.4, speedMultiplier);
};
