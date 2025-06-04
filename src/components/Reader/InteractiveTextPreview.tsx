import React, { useEffect, useRef } from "react";
import { processText } from "@/utils/rsvp-word-utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface InteractiveTextPreviewProps {
  content: string;
  currentPosition: number;
  onWordClick: (wordIndex: number) => void;
  onStartReading: () => void;
  title: string;
}

const InteractiveTextPreview = ({ 
  content, 
  currentPosition, 
  onWordClick, 
  onStartReading,
  title 
}: InteractiveTextPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedWordRef = useRef<HTMLSpanElement>(null);

  // Process the content into words
  const words = processText(content);

  // Scroll to highlighted word when position changes or component mounts
  useEffect(() => {
    if (highlightedWordRef.current && containerRef.current && currentPosition > 0) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        highlightedWordRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentPosition]);

  const handleStartReading = () => {
    // Don't set sessionStorage here - let the parent handle it
    console.log("Starting reading from position:", currentPosition);
    onStartReading();
  };

  const handleWordClick = (wordIndex: number) => {
    console.log("Word clicked:", wordIndex);
    onWordClick(wordIndex);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Interactive Text Preview</h2>
        <Button onClick={handleStartReading} className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base">
          <Play className="h-4 w-4" />
          <span className="hidden sm:inline">Start Reading from Highlighted Word</span>
          <span className="sm:hidden">Start Reading</span>
        </Button>
      </div>
      
      {currentPosition > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200">
          <p className="text-sm font-medium">
            📖 You previously stopped reading at word {currentPosition + 1} of {words.length}
          </p>
          <p className="text-xs mt-1">
            Click on any word below to start reading from that position, or use the button above to continue from where you left off.
          </p>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="max-h-[400px] overflow-y-auto overflow-x-hidden p-4 bg-gray-50 dark:bg-gray-800 rounded-md"
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h3 className="mb-4 text-base sm:text-lg font-medium">{title}</h3>
          <div className="leading-relaxed text-sm sm:text-base break-words">
            {words.map((word, index) => (
              <span
                key={index}
                ref={index === currentPosition ? highlightedWordRef : null}
                onClick={() => handleWordClick(index)}
                className={`
                  inline cursor-pointer px-1 py-0.5 rounded-sm mr-1 transition-all duration-200
                  ${index === currentPosition 
                    ? 'bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 font-semibold shadow-sm border border-purple-400 dark:border-purple-600' 
                    : 'hover:bg-blue-100 dark:hover:bg-blue-800/50'
                  }
                  ${index < currentPosition 
                    ? 'text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-gray-100'
                  }
                `}
                title={`Word ${index + 1} - Click to start reading from here`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
        Click on any word to set your reading position • Total words: {words.length} • 
        {currentPosition > 0 && (
          <span className="font-medium text-purple-600 dark:text-purple-400">
            {" "}Current position: {currentPosition + 1}
          </span>
        )}
      </div>
    </div>
  );
};

export default InteractiveTextPreview; 