import React, { useEffect, useRef } from "react";
import { processText } from "@/utils/rsvp-word-utils";
import { Button } from "@/components/ui/button";
import { Play, FileText, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlassesQRGenerator from "@/components/GlassesQRGenerator";

interface InteractiveTextPreviewProps {
  content: string;
  currentPosition: number;
  onWordClick: (wordIndex: number) => void;
  onStartReading: () => void;
  onSummarize: () => void;
  title: string;
  isSummarizing: boolean;
  summarizationError: string | null;
  contentId?: string;
}

const InteractiveTextPreview = ({ 
  content, 
  currentPosition, 
  onWordClick, 
  onStartReading,
  onSummarize,
  title,
  isSummarizing,
  summarizationError,
  contentId
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
      {/* Responsive header layout */}
      <div className="space-y-6 sm:space-y-0 mb-6">
        {/* Mobile layout: Title first, then buttons */}
        <div className="sm:hidden">
          {/* Title - Mobile only */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Select position
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words px-2">
              {title}
            </p>
          </div>
          
          {/* Action row - Mobile */}
          <div className="flex items-stretch gap-3 px-4">
            <div className="flex-1">
              {contentId ? (
                <GlassesQRGenerator 
                  contentId={contentId}
                  title={title}
                  className="w-full h-full min-h-[44px] text-sm flex items-center justify-center"
                />
              ) : (
                <div className="w-full h-full min-h-[44px]"></div>
              )}
            </div>
            <div className="flex-1">
              <Button 
                onClick={onSummarize} 
                disabled={isSummarizing}
                className="w-full h-full min-h-[44px] text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium flex items-center justify-center gap-2"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Summarize</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop layout: Three-column */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Left: QR Generator */}
          <div className="flex items-center">
            {contentId && (
              <GlassesQRGenerator 
                contentId={contentId}
                title={title}
                className="min-h-[44px]"
              />
            )}
          </div>
          
          {/* Center: Title */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Select starting position
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
              {title}
            </p>
          </div>
          
          {/* Right: Summarize button */}
          <div className="flex items-center">
            <Button 
              onClick={onSummarize} 
              disabled={isSummarizing}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[44px] font-medium text-white"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Summarize Text</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {summarizationError && (
        <Alert variant="destructive" className="mb-4 border border-red-200 dark:border-red-700">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-sm sm:text-base">
              {summarizationError.includes('quota exceeded') || summarizationError.includes('billing') ? 
                <>
                  <span className="font-medium">OpenAI API quota exceeded.</span> Your account may have run out of credits or has billing issues.
                  <a 
                    href="https://platform.openai.com/account/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1 font-medium"
                  >
                    Check account status
                  </a>
                </> : 
                summarizationError
              }
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      {currentPosition > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200">
          <p className="text-sm font-medium">
            📖 You previously stopped reading at word {currentPosition + 1} of {words.length}
          </p>
          <p className="text-xs mt-1 break-words">
            Click on any word below to start reading from that position, or use the button below to continue from where you left off.
          </p>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="max-h-[400px] overflow-y-auto overflow-x-hidden p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-4"
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="leading-relaxed text-sm sm:text-base break-words">
            {words.map((word, index) => (
              <span
                key={index}
                ref={index === currentPosition ? highlightedWordRef : null}
                onClick={() => handleWordClick(index)}
                className={`
                  inline cursor-pointer px-1 py-1 sm:py-0.5 rounded-sm mr-1 transition-all duration-200 touch-manipulation
                  ${index === currentPosition 
                    ? 'bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 font-semibold shadow-sm border border-purple-400 dark:border-purple-600' 
                    : 'hover:bg-blue-100 dark:hover:bg-blue-800/50 active:bg-blue-200 dark:active:bg-blue-700'
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
      
      <div className="text-center mb-4">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2 break-words">
          Click on any word to set your reading position • Total words: {words.length} • 
          {currentPosition > 0 && (
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {" "}Current position: {currentPosition + 1}
            </span>
          )}
        </p>
      </div>

      {/* Start Reading button */}
      <div className="text-center flex justify-center px-4 sm:px-0">
        <Button 
          onClick={handleStartReading} 
          size="lg"
          className="flex items-center gap-2 w-full sm:w-auto min-w-[200px] sm:min-w-0"
        >
          <Play className="h-4 w-4" />
          Start Reading
        </Button>
      </div>
    </div>
  );
};

export default InteractiveTextPreview; 