
import { useState } from "react";
import { summarizeText, SummarizationOptions } from "@/utils/summarization";

export const useSummarization = (content: string) => {
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizationProgress, setSummarizationProgress] = useState(0);
  const [summarizationError, setSummarizationError] = useState<string | null>(null);

  const handleSummarize = async (apiKey: string, useOpenAI: boolean) => {
    if (!content) {
      console.log("Error: No content available to summarize.");
      return;
    }
    
    setIsSummarizing(true);
    setSummarizationError(null);
    setSummarizationProgress(0);
    
    // Mock progress updates (since we can't get actual progress from the models)
    const progressInterval = setInterval(() => {
      setSummarizationProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 300);
    
    try {
      const options: SummarizationOptions = {
        maxLength: 1200,  // Increased for better quality summaries
        minLength: 400,   // Increased for better quality summaries
        apiKey,
        useOpenAI,
      };
      
      const result = await summarizeText(content, options);
      setSummary(result);
      setSummarizationProgress(100);
      
      // Removed toast notification
    } catch (error) {
      console.error("Summarization error:", error);
      setSummarizationError(error instanceof Error ? error.message : "Unknown error occurred");
      // Removed toast notification
      setSummarizationProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsSummarizing(false);
    }
  };

  return {
    summary,
    isSummarizing,
    summarizationProgress,
    summarizationError,
    handleSummarize,
    setSummary
  };
};
