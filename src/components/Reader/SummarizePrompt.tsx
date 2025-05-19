
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Text } from "lucide-react";

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
  return (
    <div className="bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Generate a summary of this content for faster reading.
          {summarizationError && (
            <span className="block text-red-500 mt-2">
              Error: {summarizationError}
            </span>
          )}
        </p>
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
          onClick={onReadFullText}
        >
          Skip and Read Full Text
        </Button>
      </div>
    </div>
  );
};

export default SummarizePrompt;
