
import { FormattedWord } from "./rsvp-types";
import { getSpeedAdjustmentFactor, calculateComplexity, isAcronym, isTechnicalTerm } from "@/utils/textAnalysis";

/**
 * Process text into an array of words
 */
export function processText(text: string): string[] {
  if (!text) return [];
  
  return text
    .replace(/\n/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 0);
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
  return 4;
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
