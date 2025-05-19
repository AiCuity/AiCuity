
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { processText, formatWord, calculateProgress } from "@/utils/rsvp-word-utils";
import { RSVPReaderOptions, RSVPReaderHook } from "@/utils/rsvp-types";
import { usePlaybackControls } from "./rsvp/usePlaybackControls";
import { useHistoryTracker } from "./rsvp/useHistoryTracker";

export function useRSVPReader({ 
  text,
  initialWpm = 300,
  initialSmartPacing = true,
  initialShowToasts = true,
  initialPosition = 0,
  contentId
}: RSVPReaderOptions): RSVPReaderHook {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseWpm, setBaseWpm] = useState(initialWpm);
  const [effectiveWpm, setEffectiveWpm] = useState(initialWpm);
  const [currentComplexity, setCurrentComplexity] = useState(0);
  const [smartPacingEnabled, setSmartPacingEnabled] = useState(initialSmartPacing);
  const [showToasts, setShowToasts] = useState(initialShowToasts);
  
  const { toast } = useToast();
  
  // Process text into words on component mount or when text changes
  useEffect(() => {
    const processedWords = processText(text);
    setWords(processedWords);
  }, [text]);
  
  // Get playback controls
  const [playbackRefs, { 
    startReading, stopReading, updateReading, 
    goToNextWord, goToPreviousWord, restartReading 
  }] = usePlaybackControls(
    words,
    baseWpm,
    smartPacingEnabled,
    showToasts,
    setCurrentWordIndex,
    setIsPlaying,
    setEffectiveWpm,
    setCurrentComplexity
  );
  
  // Get history tracking functionality
  const { savePosition } = useHistoryTracker(
    contentId,
    currentWordIndex,
    isPlaying,
    baseWpm,
    text,
    showToasts
  );

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startReading();
    } else {
      stopReading();
    }
    
    return () => {
      stopReading();
    };
  }, [isPlaying, baseWpm, currentWordIndex, smartPacingEnabled]);

  // Toggle smart pacing
  const toggleSmartPacing = () => {
    setSmartPacingEnabled(prev => !prev);
    if (showToasts) {
      toast({
        title: smartPacingEnabled ? "Smart Pacing Disabled" : "Smart Pacing Enabled",
        description: smartPacingEnabled 
          ? "Reading at constant speed" 
          : "Speed will adjust based on text complexity",
      });
    }
  };

  // Handle WPM change
  const handleWpmChange = (value: number[]) => {
    setBaseWpm(value[0]);
  };

  // Format the current word for display
  const formattedWord = formatWord(words[currentWordIndex] || "");
  
  // Calculate reading progress
  const progress = calculateProgress(currentWordIndex, words.length);

  return {
    words,
    currentWordIndex,
    isPlaying,
    setIsPlaying,
    baseWpm,
    effectiveWpm,
    currentComplexity,
    smartPacingEnabled,
    goToNextWord,
    goToPreviousWord,
    toggleSmartPacing,
    handleWpmChange,
    formattedWord,
    progress,
    restartReading,
    setShowToasts,
    showToasts,
    savePosition
  };
}
