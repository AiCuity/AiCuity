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
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Generate a summary of this content for faster reading.
        </p>
        
        {summarizationError && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {summarizationError.includes('quota exceeded') || summarizationError.includes('billing') ? 
                <>
                  OpenAI API quota exceeded. Your account may have run out of credits or has billing issues.
                  <a 
                    href="https://platform.openai.com/account/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1"
                  >
                    Check account status
                  </a>
                </> : 
                summarizationError
              }
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onSummarize} 
          disabled={isSummarizing}
          size="lg"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Text className="mr-2 h-5 w-5" />
              Summarize Text
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleReadFullText}
        >
          Skip and Read Full Text
        </Button>
      </div>
    </div>
  );
};

export default SummarizePrompt;
