
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatWord } from '@/utils/rsvp-word-utils';

interface CalibrationTestDisplayProps {
  words: string[];
  currentWordIndex: number;
  totalWords: number;
  isPlaying: boolean;
  isComplete: boolean;
  onTogglePlayPause: () => void;
}

const CalibrationTestDisplay: React.FC<CalibrationTestDisplayProps> = ({
  words,
  currentWordIndex,
  totalWords,
  isPlaying,
  isComplete,
  onTogglePlayPause
}) => {
  // Get the current word and format it
  const currentWord = words[currentWordIndex] || '';
  const { before, highlight, after } = formatWord(currentWord);
  
  // Calculate progress
  const progress = Math.min(Math.round((currentWordIndex / totalWords) * 100), 100);
  
  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-center items-center h-40 overflow-hidden">
        {isComplete ? (
          <div className="text-center">
            <p className="text-lg font-medium">Reading Complete</p>
          </div>
        ) : (
          <div className="font-mono text-center text-3xl flex items-center">
            <div className="text-right opacity-70 min-w-[100px] mr-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {before}
            </div>
            <div className="text-red-500 font-bold">{highlight}</div>
            <div className="text-left opacity-70 min-w-[100px] ml-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {after}
            </div>
          </div>
        )}
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <Button 
            onClick={onTogglePlayPause}
            variant={isPlaying ? "secondary" : "default"}
            disabled={isComplete}
          >
            {isPlaying ? "Pause" : "Resume"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentWordIndex} / {totalWords} words
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalibrationTestDisplay;
