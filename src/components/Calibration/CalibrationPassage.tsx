
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRSVPReader } from '@/hooks/useRSVPReader';

interface CalibrationPassageProps {
  text: string; 
  wpm: number;  
  title?: string; 
  onComplete: () => void; 
}

const CalibrationPassage: React.FC<CalibrationPassageProps> = ({ 
  text, 
  wpm, 
  title, 
  onComplete 
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLastWordDisplayed, setIsLastWordDisplayed] = useState(false);
  
  // Make sure we're passing a number for WPM
  const numericWpm = typeof wpm === 'number' ? wpm : parseInt(String(wpm), 10) || 300;
  
  console.log("CalibrationPassage - WPM type:", typeof wpm, "Value:", wpm);
  console.log("CalibrationPassage - Numeric WPM:", numericWpm);
  
  const { 
    isPlaying, 
    setIsPlaying, 
    currentWordIndex, 
    formattedWord,
    progress,
    words,
    handleWpmChange,
    smartPacingEnabled, 
    toggleSmartPacing
  } = useRSVPReader({ 
    text,
    initialWpm: numericWpm, // Pass as a number
    initialSmartPacing: false, // Disable smart pacing for calibration to ensure consistent WPM
    initialPosition: 0,
    contentId: "calibration" // Use a special contentId for calibration
  });

  // Set the WPM when the component mounts or when wpm prop changes
  useEffect(() => {
    // Make sure we're passing a number array, not a single value
    console.log("Setting calibration WPM to:", numericWpm);
    handleWpmChange([numericWpm]);
  }, [numericWpm, handleWpmChange]);

  // Auto-start reading when user clicks the start button
  useEffect(() => {
    if (isStarted && !isPlaying) {
      console.log("Auto-starting reading at WPM:", numericWpm);
      setIsPlaying(true);
    }
  }, [isStarted, isPlaying, setIsPlaying, numericWpm]);

  // Detect when we reach the last word
  useEffect(() => {
    if (isStarted && words.length > 0 && currentWordIndex >= words.length - 1) {
      // We're at the last word - mark it as displayed but don't finish yet
      setIsLastWordDisplayed(true);
      
      // Only stop playing after a delay to ensure the last word is visible
      if (isLastWordDisplayed) {
        // Add a short delay to ensure the last word is seen by the user
        const timer = setTimeout(() => {
          setIsFinished(true);
          setIsPlaying(false);
          onComplete();
        }, 1000); // 1 second delay to show the last word
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentWordIndex, words, isStarted, isLastWordDisplayed, setIsPlaying, onComplete]);

  const handleStart = () => {
    console.log("Starting calibration reading at WPM:", numericWpm);
    setIsStarted(true);
    // We'll let the effect hook above handle the actual play state
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{title || `Reading Test at ${numericWpm} WPM`}</h3>
          <p className="text-sm text-gray-500">Speed: {numericWpm} WPM</p>
        </div>

        {!isStarted ? (
          <div className="text-center py-10">
            <p className="mb-4">
              You'll read a short passage at {numericWpm} WPM. After reading, you'll answer questions about the content.
            </p>
            <Button onClick={handleStart}>Start Reading</Button>
          </div>
        ) : (
          <div className="py-6">
            {!isFinished ? (
              <>
                <div className="flex justify-center items-center h-40">
                  {/* Using font-mono to ensure consistent letter width */}
                  <div className="font-mono text-center text-4xl flex items-center">
                    <div className="text-right opacity-70 min-w-[120px] mr-1 overflow-hidden whitespace-nowrap text-ellipsis">{formattedWord.before}</div>
                    <div className="text-red-500 font-bold">{formattedWord.highlight}</div>
                    <div className="text-left opacity-70 min-w-[120px] ml-1 overflow-hidden whitespace-nowrap text-ellipsis">{formattedWord.after}</div>
                  </div>
                </div>
                <Progress value={progress} className="my-4 h-2" />
                <div className="flex justify-center mt-4">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? "Pause" : "Resume"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium">Reading Complete</p>
                <p className="text-gray-500 mt-2">
                  Now you'll answer some questions about what you just read.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalibrationPassage;
