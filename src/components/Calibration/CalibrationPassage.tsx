
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRSVPReader } from '@/hooks/useRSVPReader';

interface CalibrationPassageProps {
  passage: {
    id: string;
    title: string;
    content: string;
    wpm: number;
  };
  onComplete: (passageId: string) => void;
}

const CalibrationPassage: React.FC<CalibrationPassageProps> = ({ passage, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { 
    isPlaying, 
    setIsPlaying, 
    currentWordIndex, 
    formattedWord,
    progress,
    words
  } = useRSVPReader({ text: passage.content });

  useEffect(() => {
    // Check if we've reached the end
    if (isStarted && words.length > 0 && currentWordIndex >= words.length - 1) {
      setIsFinished(true);
      setIsPlaying(false);
      onComplete(passage.id);
    }
  }, [currentWordIndex, words, isStarted, passage.id, onComplete, setIsPlaying]);

  const handleStart = () => {
    setIsStarted(true);
    setIsPlaying(true);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{passage.title}</h3>
          <p className="text-sm text-gray-500">Speed: {passage.wpm} WPM</p>
        </div>

        {!isStarted ? (
          <div className="text-center py-10">
            <p className="mb-4">
              You'll read a short passage at {passage.wpm} WPM. After reading, you'll answer questions about the content.
            </p>
            <Button onClick={handleStart}>Start Reading</Button>
          </div>
        ) : (
          <div className="py-6">
            {!isFinished ? (
              <>
                <div className="flex justify-center items-center h-40 text-4xl">
                  <span className="opacity-70">{formattedWord.before}</span>
                  <span className="text-primary font-bold">{formattedWord.highlight}</span>
                  <span className="opacity-70">{formattedWord.after}</span>
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
