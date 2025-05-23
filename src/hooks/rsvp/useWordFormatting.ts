
import { useMemo } from "react";
import { formatWord } from "@/utils/rsvp-word-utils";
import { calculateProgressPercentage } from "@/hooks/readingHistory/utils/progressUtils";
import { FormattedWord } from "@/utils/rsvp-types";

interface WordFormattingOptions {
  words: string[];
  currentWordIndex: number;
}

export interface WordFormattingOutput {
  formattedWord: FormattedWord;
  progress: number;
}

export function useWordFormatting({
  words,
  currentWordIndex
}: WordFormattingOptions): WordFormattingOutput {
  // Format the current word for display
  const formattedWord = useMemo(() => {
    if (words.length === 0 || currentWordIndex >= words.length) {
      return { before: "", highlight: "", after: "" };
    }
    return formatWord(words[currentWordIndex]);
  }, [words, currentWordIndex]);
  
  // Calculate current progress (percentage)
  const progress = useMemo(() => {
    if (words.length === 0) return 0;
    // Use the utility function to calculate progress percentage
    return calculateProgressPercentage(currentWordIndex, words.length);
  }, [currentWordIndex, words.length]);
  
  return {
    formattedWord,
    progress
  };
}
