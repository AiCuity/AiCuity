
import { FormattedWord } from "./rsvp-types";
import { getSpeedAdjustmentFactor, calculateComplexity, isAcronym, isTechnicalTerm } from "@/utils/textAnalysis";

/**
 * Process text into an array of words
 * Now with improved handling for very long words
 */
export function processText(text: string): string[] {
  if (!text) return [];
  
  // Split by whitespace and filter out empty strings
  const initialWords = text
    .replace(/\n/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Break down extremely long words (more than 25 chars)
  const processedWords: string[] = [];
  const MAX_WORD_LENGTH = 25;
  
  initialWords.forEach(word => {
    if (word.length <= MAX_WORD_LENGTH) {
      processedWords.push(word);
    } else {
      // Handle hyphenation for long words
      let remainingWord = word;
      while (remainingWord.length > MAX_WORD_LENGTH) {
        // Look for natural hyphenation points like dashes or camelCase
        let breakPoint = findBreakPoint(remainingWord, MAX_WORD_LENGTH);
        
        // Add hyphen if we're breaking in the middle of a continuous word
        const firstPart = remainingWord.substring(0, breakPoint);
        
        // If breaking at a non-natural division point, add hyphen
        if (!['_', '-', '/', '.'].includes(remainingWord[breakPoint - 1]) && 
            breakPoint < remainingWord.length) {
          processedWords.push(firstPart + "-");
        } else {
          processedWords.push(firstPart);
        }
        
        remainingWord = remainingWord.substring(breakPoint);
      }
      
      if (remainingWord.length > 0) {
        processedWords.push(remainingWord);
      }
    }
  });
  
  return processedWords;
}

/**
 * Find an appropriate break point for a long word
 * Prioritizes breaking at punctuation, then camelCase, then position
 */
function findBreakPoint(word: string, maxLength: number): number {
  // First try to find natural dividers like hyphens, underscores, etc.
  for (let i = maxLength; i > maxLength - 10 && i > 0; i--) {
    if (i >= word.length) continue;
    
    const char = word[i];
    if (['_', '-', '/', '.'].includes(char)) {
      return i + 1; // Break after the divider
    }
  }
  
  // Then look for camelCase or PascalCase transitions
  for (let i = maxLength; i > maxLength - 10 && i > 1; i--) {
    if (i >= word.length) continue;
    
    // Check for lowercase to uppercase transition (camelCase)
    if (/[a-z]/.test(word[i-1]) && /[A-Z]/.test(word[i])) {
      return i;
    }
  }
  
  // If no natural break is found, break at the maximum allowed length
  return Math.min(maxLength, word.length);
}

/**
 * Calculate the optimal letter position (OLP) for better reading
 */
export function calculateOlp(word: string): number {
  const length = word.length;
  
  if (length <= 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return Math.min(4, Math.floor(length / 3)); // Cap at 4 but ensure it's not out of bounds
}

/**
 * Format a word with highlighted optimal letter position
 */
export function formatWord(word: string): FormattedWord {
  if (!word) return { before: "", highlight: "", after: "" };
  
  const olp = calculateOlp(word);
  
  return {
    before: word.substring(0, olp),
    highlight: word.charAt(olp),
    after: word.substring(olp + 1)
  };
}

/**
 * Get adjusted reading speed based on word complexity
 */
export function getAdjustedWpm(
  currentWord: string,
  previousWord: string | null,
  baseWpm: number,
  smartPacingEnabled: boolean
): number {
  if (!smartPacingEnabled) return baseWpm;
  
  const speedAdjustment = getSpeedAdjustmentFactor(currentWord, previousWord, baseWpm);
  return Math.round(baseWpm * speedAdjustment);
}

/**
 * Get word complexity and check if toast should be shown
 */
export function getWordComplexityData(
  currentWord: string,
  smartPacingEnabled: boolean,
  showToasts: boolean
): {
  complexity: number;
  shouldShowToast: boolean;
  reason?: string;
} {
  const complexity = calculateComplexity(currentWord);
  
  const isComplex = complexity > 0.7;
  const isAnAcronym = isAcronym(currentWord);
  const isTechnical = isTechnicalTerm(currentWord);
  
  let shouldShowToast = false;
  let reason: string | undefined;
  
  if (smartPacingEnabled && showToasts && (isComplex || isAnAcronym || isTechnical)) {
    // Only show toast occasionally to avoid overwhelming the user
    if (Math.random() < 0.3) {
      shouldShowToast = true;
      reason = isAnAcronym ? "acronym" : 
              isTechnical ? "technical term" : "complex word";
    }
  }
  
  return { complexity, shouldShowToast, reason };
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(currentIndex: number, totalWords: number): number {
  return totalWords > 0 ? (currentIndex / totalWords) * 100 : 0;
}
