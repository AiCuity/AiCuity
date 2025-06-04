import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Text, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SummarizePromptProps {
  onSummarize: () => void;
  onReadFullText: () => void;
  isSummarizing: boolean;
  summarizationError: string | null;
}

const SummarizePrompt = ({ 
  onSummarize, 
  onReadFullText, 
  isSummarizing, 
  summarizationError 
}: SummarizePromptProps) => {
  const handleReadFullText = () => {
    // Clear any position from session storage when starting fresh reading
    sessionStorage.removeItem('initialPosition');
    onReadFullText();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold">Content Summary</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            Generate a summary of this content for faster reading.
          </p>
        </div>
        
        {summarizationError && (
          <Alert variant="destructive" className="w-full border border-red-200 dark:border-red-700">
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
        
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button 
            onClick={onSummarize} 
            disabled={isSummarizing}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSummarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span className="text-sm sm:text-base">Summarizing...</span>
              </>
            ) : (
              <>
                <Text className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Summarize Text</span>
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReadFullText}
            size="lg"
            className="w-full text-sm sm:text-base"
            disabled={isSummarizing}
          >
            Skip and Read Full Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SummarizePrompt;
