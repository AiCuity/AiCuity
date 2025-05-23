
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReadingPositionOptions {
  words: string[];
  currentWordIndex: number;
  setCurrentWordIndex: (index: number | ((prev: number) => number)) => void;
  showToasts: boolean;
}

export interface ReadingPositionControls {
  goToNextWord: () => void;
  goToPreviousWord: () => void;
  restartReading: () => void;
}

export function useRSVPReadingPosition({
  words, 
  currentWordIndex, 
  setCurrentWordIndex, 
  showToasts
}: ReadingPositionOptions): ReadingPositionControls {
  const { toast } = useToast();
  
  const goToPreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prevIndex => prevIndex - 1);
    } else {
      if (showToasts) {
        toast({
          title: "Beginning of Text",
          description: "You are at the beginning of the text.",
        });
      }
    }
  }, [currentWordIndex, setCurrentWordIndex, showToasts, toast]);
  
  const goToNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    } else {
      if (showToasts) {
        toast({
          title: "End of Text",
          description: "You have reached the end of the text.",
        });
      }
    }
  }, [currentWordIndex, words.length, setCurrentWordIndex, showToasts, toast]);
  
  const restartReading = useCallback(() => {
    setCurrentWordIndex(0);
    if (showToasts) {
      toast({
        title: "Reading Restarted",
        description: "Starting from the beginning.",
      });
    }
  }, [setCurrentWordIndex, showToasts, toast]);
  
  return {
    goToNextWord,
    goToPreviousWord,
    restartReading
  };
}
