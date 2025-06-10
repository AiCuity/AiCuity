import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Play, FileText } from "lucide-react";
import GlassesQRGenerator from "@/components/GlassesQRGenerator";

interface SummaryPanelProps {
  summary: string;
  fullText: string;
  title: string;
  source?: string;
  isLoading: boolean;
  progress: number;
  onStartReading: (useFullText: boolean) => void;
  onRetry: () => void;
  onBackToText: () => void;
  contentId?: string;
}

const SummaryPanel = ({
  summary,
  fullText,
  title,
  source,
  isLoading,
  progress,
  onStartReading,
  onRetry,
  onBackToText,
  contentId
}: SummaryPanelProps) => {
  
  const handleRetry = () => {
    // Call parent's retry function
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    }
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
              Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words px-2">
              {title}
            </p>
          </div>
          
          {/* Action row - Mobile */}
          <div className="flex items-stretch gap-3 px-2">
            <div className="flex-1">
              {contentId && (
                <GlassesQRGenerator 
                  contentId={contentId}
                  title={title}
                  className="w-full min-h-[44px] h-full"
                />
              )}
            </div>
            <div className="flex-1">
              <Button 
                onClick={onBackToText}
                className="flex items-center justify-center gap-2 w-full min-h-[44px] h-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              >
                <FileText className="h-4 w-4" />
                <span className="font-medium">Back to Full Text</span>
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
              Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
              {title}
            </p>
          </div>
          
          {/* Right: Back button */}
          <div className="flex items-center">
            <Button 
              onClick={onBackToText}
              className="flex items-center justify-center gap-2 min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Back to Full Text</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Generating summary... This might take a moment.
          </p>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>
      ) : summary ? (
        <>
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                {summary}
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
              Click on any word to set your reading position • Total words: {summary.split(' ').length} •
            </p>
          </div>

          {/* Read Summary button */}
          <div className="text-center flex justify-center px-4 sm:px-0">
            <Button 
              onClick={() => onStartReading(false)}
              size="lg"
              className="flex items-center gap-2 w-full sm:w-auto min-w-[200px] sm:min-w-0"
            >
              <Play className="h-4 w-4" />
              Read Summary
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            Summary generation failed. Please try again.
          </p>
          <Button onClick={handleRetry} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Summarization
          </Button>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
